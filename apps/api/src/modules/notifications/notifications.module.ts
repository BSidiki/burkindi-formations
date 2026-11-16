import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { AlertsService } from './alerts.service';
import { AlertsProcessor } from './alerts.processor';
@Module({ imports: [BullModule.registerQueue({ name: 'alerts' })], providers: [AlertsService, AlertsProcessor], exports: [AlertsService] })
export class NotificationsModule {}
