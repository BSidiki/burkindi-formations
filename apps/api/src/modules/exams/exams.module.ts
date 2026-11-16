import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ExamsController } from './exams.controller';
import { CopiesProcessor } from './copies.processor';
@Module({ imports: [BullModule.registerQueue({ name: 'copies' })], controllers: [ExamsController], providers: [CopiesProcessor] })
export class ExamsModule {}
