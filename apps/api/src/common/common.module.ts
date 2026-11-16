import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { RedisService } from './redis.service';
import { JwtGuard } from './jwt.guard';
import { RolesGuard } from './roles.guard';
import { IpWhitelistGuard } from './ip-whitelist.guard';

@Global()
@Module({
  imports: [JwtModule.register({})],
  providers: [RedisService, JwtGuard, RolesGuard, IpWhitelistGuard],
  exports: [JwtModule, RedisService, JwtGuard, RolesGuard, IpWhitelistGuard],
})
export class CommonModule {}
