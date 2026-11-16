import { Global, Module } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { SessionsGateway } from './sessions.gateway';
@Global()
@Module({ providers: [SessionsService, SessionsGateway], exports: [SessionsService, SessionsGateway] })
export class SessionsModule {}
