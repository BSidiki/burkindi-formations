import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../../common/jwt.guard';
import { RolesGuard, Roles } from '../../common/roles.guard';
import { IpWhitelistGuard } from '../../common/ip-whitelist.guard';
import { PrismaService } from '../../prisma/prisma.module';

@Controller()
@UseGuards(JwtGuard, RolesGuard)
export class FeedbacksController {
  constructor(private prisma: PrismaService) {}

  // --- apprenant : signalement contextuel rattaché à une question
  @Post('feedbacks') @Roles('APPRENANT')
  create(@Req() req: any, @Body() b: { questionId: string; motif: string; message: string }) {
    return this.prisma.feedback.create({ data: { userId: req.user.sub, ...b } });
  }
  @Post('assistance') @Roles('APPRENANT')
  assistance(@Req() req: any, @Body() b: { sujet: string; question: string }) {
    return this.prisma.assistanceRequest.create({ data: { userId: req.user.sub, ...b } });
  }

  // --- admin
  @Get('admin/feedbacks') @Roles('ADMIN') @UseGuards(IpWhitelistGuard)
  list() { return this.prisma.feedback.findMany({ include: { user: { select: { nom: true, prenom: true } } }, orderBy: { createdAt: 'desc' } }); }

  @Patch('admin/feedbacks/:id/reply') @Roles('ADMIN') @UseGuards(IpWhitelistGuard)
  reply(@Param('id') id: string, @Body() b: { reply: string }) {
    return this.prisma.feedback.update({ where: { id }, data: { adminReply: b.reply, statut: 'REPONDU' } });
  }
  @Post('admin/feedbacks/:id/relance') @Roles('ADMIN') @UseGuards(IpWhitelistGuard)
  relance(@Param('id') id: string) {
    return this.prisma.feedback.update({ where: { id }, data: { relanceCount: { increment: 1 } } });
  }
}
