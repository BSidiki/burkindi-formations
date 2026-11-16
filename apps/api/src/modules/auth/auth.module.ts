import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { FidoService } from './fido.service';
@Module({ controllers: [AuthController], providers: [AuthService, FidoService] })
export class AuthModule {}
