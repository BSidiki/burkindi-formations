import { Global, Module } from '@nestjs/common';
import { SecurityService } from './security.service';
import { NotificationsModule } from '../notifications/notifications.module';
@Global()
@Module({ imports: [NotificationsModule], providers: [SecurityService], exports: [SecurityService] })
export class SecurityModule {}
