import { BadRequestException, Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../../common/jwt.guard';
import { RolesGuard, Roles } from '../../common/roles.guard';
import { PrismaService } from '../../prisma/prisma.module';
const cfg = require('@burkindi/config');

@Controller()
@UseGuards(JwtGuard, RolesGuard)
@Roles('APPRENANT')
export class WithdrawalsController {
  constructor(private prisma: PrismaService) {}

  @Get('referral/summary')
  async summary(@Req() req: any) {
    const u = await this.prisma.user.findUniqueOrThrow({ where: { id: req.user.sub } });
    const filleulsActifs = await this.prisma.user.count({ where: { referredById: u.id, statut: 'ACTIF' } });
    return { code: u.referralCode, balance: u.balance, filleulsActifs, rate: cfg.referralRate };
  }

  @Post('withdrawals')
  async request(@Req() req: any, @Body() b: { amount: number; operator: 'ORANGE_MONEY' | 'MOOV_MONEY'; phone: string }) {
    const { min, step } = cfg.withdrawal;
    if (!Number.isInteger(b.amount) || b.amount < min || b.amount % step !== 0) throw new BadRequestException(`Minimum ${min} FCFA, par pas de ${step}`);
    return this.prisma.$transaction(async tx => {
      const r = await tx.user.updateMany({ where: { id: req.user.sub, balance: { gte: b.amount } }, data: { balance: { decrement: b.amount } } });
      if (r.count === 0) throw new BadRequestException('Solde insuffisant'); // débit atomique : pas de double retrait
      return tx.withdrawal.create({ data: { userId: req.user.sub, amount: b.amount, operator: b.operator, phone: b.phone } });
    });
  }
}
