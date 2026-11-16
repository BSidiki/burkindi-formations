import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { JwtGuard } from '../../common/jwt.guard';
import { RolesGuard, Roles } from '../../common/roles.guard';
import { PrismaService } from '../../prisma/prisma.module';
import { RedisService } from '../../common/redis.service';
import { SecurityService } from '../security/security.service';
import { clientIp } from '../../common/ip-whitelist.guard';

@Controller('exams')
@UseGuards(JwtGuard, RolesGuard)
@Roles('APPRENANT')
export class ExamsController {
  constructor(private prisma: PrismaService, private redis: RedisService, private security: SecurityService,
              @InjectQueue('copies') private copies: Queue) {}

  /** Les questions sont servies SANS la bonne réponse (cache Redis par concours). */
  @Get('questions')
  async questions(@Req() req: any, @Query('concours') concoursId?: string) {
    const u = await this.prisma.user.findUniqueOrThrow({ where: { id: req.user.sub }, include: { concours: true } });
    const ids = concoursId ? [concoursId] : u.concours.map(c => c.id);
    const key = `qcm:${ids.sort().join(',')}`;
    const cached = await this.redis.get(key);
    if (cached) return JSON.parse(cached);
    const qs = await this.prisma.question.findMany({
      where: { concoursId: { in: ids } },
      select: { id: true, matiere: true, enonce: true, options: true, publicNote: true },
    });
    await this.redis.set(key, JSON.stringify(qs), 'EX', 300);
    return qs;
  }

  /** Révision libre : correction immédiate d'une réponse. */
  @Post('questions/:id/answer')
  async answer(@Param('id') id: string, @Body() b: { index: number }) {
    const q = await this.prisma.question.findUniqueOrThrow({ where: { id } });
    return { correct: q.correctIndex === b.index, correctIndex: q.correctIndex, explication: q.explication, publicNote: q.publicNote };
  }

  /** Examen blanc : la copie est mise en file BullMQ puis corrigée par le worker. */
  @Post('submit')
  async submit(@Req() req: any, @Body() b: { mode: string; answers: Record<string, number>; durationSec: number; focusLossCount: number }) {
    const a = await this.prisma.examAttempt.create({
      data: { userId: req.user.sub, mode: b.mode, answers: b.answers, durationSec: b.durationSec, focusLossCount: b.focusLossCount },
    });
    await this.copies.add('correct', { attemptId: a.id }, { attempts: 3, backoff: 3000 });
    return { id: a.id, queued: true };
  }

  @Post('focus-loss')
  async focusLoss(@Req() req: any, @Body() b: { reason?: string }) {
    const u = await this.prisma.user.update({ where: { id: req.user.sub }, data: { focusLossCount: { increment: 1 } } });
    await this.security.log('FOCUS_LOST', `${b.reason ?? 'Sortie de fenêtre'} (focus_loss_count = ${u.focusLossCount})`,
      { userId: u.id, deviceHash: u.activeDevice ?? undefined, ip: clientIp(req) });
    return { focusLossCount: u.focusLossCount };
  }

  @Get('stats')
  async stats(@Req() req: any) {
    const a = await this.prisma.examAttempt.findMany({ where: { userId: req.user.sub, score: { not: null } }, orderBy: { submittedAt: 'desc' }, take: 6 });
    const avg = a.length ? a.reduce((s, x) => s + (x.score ?? 0), 0) / a.length : 0;
    return { sessions: a.reverse().map(x => ({ at: x.submittedAt, score: x.score })), moyennePct: Math.round(avg) };
  }
}
