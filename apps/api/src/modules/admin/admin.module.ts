import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { PaymentsModule } from '../payments/payments.module';
@Module({ imports: [PaymentsModule], controllers: [AdminController] })
export class AdminModule {}
