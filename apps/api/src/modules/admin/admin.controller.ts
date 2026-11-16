import { Body, Controller, Get, Param, Patch, Post, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import * as ExcelJS from 'exceljs';
import { JwtGuard } from '../../common/jwt.guard';
import { IpWhitelistGuard } from '../../common/ip-whitelist.guard';
import { RolesGuard, Roles } from '../../common/roles.guard';
import { PrismaService } from '../../prisma/prisma.module';
import { PaymentsService } from '../payments/payments.service';
import { SessionsService } from '../sessions/sessions.service';
import { RedisService } from '../../common/redis.service';

@Controller('admin')
@UseGuards(IpWhitelistGuard, JwtGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(private prisma: PrismaService, private payments: PaymentsService,
              private sessions: SessionsService, private redis: RedisService) {}

  private where(q?: string, statut?: string, voie?: string, niveau?: string) {
    return { role: 'APPRENANT' as const,
      ...(statut && { statut: statut as any }), ...(voie && { voie: voie as any }), ...(niveau && { niveau }),
      ...(q && { OR: [{ nom: { contains: q, mode: 'insensitive' as const } }, { prenom: { contains: q, mode: 'insensitive' as const } },
                      { telephone: { contains: q } }, { referralCode: { contains: q, mode: 'insensitive' as const } }] }) };
  }

  @Get('students')
  students(@Query() f: { q?: string; statut?: string; voie?: string; niveau?: string }) {
    return this.prisma.user.findMany({ where: this.where(f.q, f.statut, f.voie, f.niveau),
      include: { concours: true, payments: { orderBy: { createdAt: 'desc' }, take: 1 }, referredBy: { select: { referralCode: true } } },
      orderBy: { createdAt: 'desc' }, take: 200 });
  }

  @Get('kpis')
  async kpis() {
    const [inscrits, actifs, enAttente, alertes, ristournes] = await Promise.all([
      this.prisma.user.count({ where: { role: 'APPRENANT' } }),
      this.prisma.user.count({ where: { role: 'APPRENANT', statut: 'ACTIF' } }),
      this.prisma.payment.count({ where: { status: 'EN_ATTENTE' } }),
      this.prisma.securityLog.count({ where: { createdAt: { gte: new Date(Date.now() - 86400_000) } } }),
      this.prisma.withdrawal.aggregate({ _sum: { amount: true } }),
    ]);
    return { inscrits, actifs, paiementsEnAttente: enAttente, alertes24h: alertes, retraitsDemandes: ristournes._sum.amount ?? 0 };
  }

  @Post('payments/:id/validate') validate(@Param('id') id: string) { return this.payments.validate(id); }
  @Post('payments/:id/reject') reject(@Param('id') id: string) { return this.payments.reject(id); }

  @Patch('students/:id/suspend')
  suspend(@Param('id') id: string, @Body() b: { suspended: boolean }) {
    return this.prisma.user.update({ where: { id }, data: { statut: b.suspended ? 'SUSPENDU' : 'ACTIF' } });
  }
  @Post('students/:id/reset-device') resetDevice(@Param('id') id: string) { return this.sessions.resetDevice(id); }

  /** Édition directe d'un QCM + note explicative publique ; invalide le cache Redis. */
  @Patch('questions/:id')
  async editQuestion(@Param('id') id: string, @Body() b: { enonce?: string; explication?: string; publicNote?: string }) {
    const q = await this.prisma.question.update({ where: { id }, data: b });
    const keys = await this.redis.keys('qcm:*'); if (keys.length) await this.redis.del(...keys);
    return q;
  }

  @Get('security-logs')
  logs() { return this.prisma.securityLog.findMany({ orderBy: { createdAt: 'desc' }, take: 200, include: { user: { select: { nom: true, prenom: true } } } }); }

  @Get('students/export.xlsx')
  async export(@Res() res: Response, @Query() f: { q?: string; statut?: string; voie?: string; niveau?: string }) {
    const rows = await this.prisma.user.findMany({ where: this.where(f.q, f.statut, f.voie, f.niveau), include: { referredBy: true } });
    const wb = new ExcelJS.Workbook(); const ws = wb.addWorksheet('Apprenants');
    ws.columns = [
      { header: 'Nom', key: 'nom' }, { header: 'Prénom(s)', key: 'prenom' }, { header: 'Téléphone', key: 'telephone' },
      { header: 'Statut', key: 'statut' }, { header: 'Voie', key: 'voie' }, { header: 'Niveau', key: 'niveau' },
      { header: 'Code parrain', key: 'referralCode' }, { header: 'Parrain utilisé', key: 'parrain' },
      { header: 'Solde ristourne (FCFA)', key: 'balance' }, { header: 'Appareil', key: 'activeDevice' },
    ];
    rows.forEach(r => ws.addRow({ ...r, parrain: r.referredBy?.referralCode ?? '' }));
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=apprenants.xlsx');
    await wb.xlsx.write(res); res.end();
  }
}
