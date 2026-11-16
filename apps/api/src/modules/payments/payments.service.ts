import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.module';
const cfg = require('@burkindi/config');

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  /** Validation manuelle en un clic : active le compte et crédite 15 % du montant payé au parrain (transaction atomique). */
  async validate(paymentId: string) {
    return this.prisma.$transaction(async tx => {
      const p = await tx.payment.findUniqueOrThrow({ where: { id: paymentId }, include: { user: true } });
      if (p.status !== 'EN_ATTENTE') throw new BadRequestException('Paiement déjà traité');
      await tx.payment.update({ where: { id: p.id }, data: { status: 'VALIDE', validatedAt: new Date() } });
      await tx.user.update({ where: { id: p.userId }, data: { statut: 'ACTIF' } });
      let commission = 0;
      if (p.user.referredById) {
        commission = Math.round(p.amount * cfg.referralRate);
        await tx.user.update({ where: { id: p.user.referredById }, data: { balance: { increment: commission } } });
      }
      return { userId: p.userId, commission };
    });
  }

  async reject(paymentId: string) {
    return this.prisma.payment.update({ where: { id: paymentId }, data: { status: 'REJETE' } });
  }
}
