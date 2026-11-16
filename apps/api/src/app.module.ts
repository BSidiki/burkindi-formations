import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from './prisma/prisma.module';
import { CommonModule } from './common/common.module';
import { AuthModule } from './modules/auth/auth.module';
import { SessionsModule } from './modules/sessions/sessions.module';
import { SecurityModule } from './modules/security/security.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ExamsModule } from './modules/exams/exams.module';
import { FeedbacksModule } from './modules/feedbacks/feedbacks.module';
import { LibraryModule } from './modules/library/library.module';
import { WithdrawalsModule } from './modules/withdrawals/withdrawals.module';
import { AdminModule } from './modules/admin/admin.module';
import { HealthController } from './common/health.controller';

@Module({
  controllers: [HealthController],
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    BullModule.forRoot({ connection: { url: process.env.REDIS_URL } }),
    PrismaModule, CommonModule, AuthModule, SessionsModule, SecurityModule, NotificationsModule,
    PaymentsModule, ExamsModule, FeedbacksModule, LibraryModule, WithdrawalsModule, AdminModule,
  ],
})
export class AppModule {}
