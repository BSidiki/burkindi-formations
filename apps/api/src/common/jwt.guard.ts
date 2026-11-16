import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(private jwt: JwtService) {}
  canActivate(ctx: ExecutionContext) {
    const req = ctx.switchToHttp().getRequest();
    const token = req.cookies?.access ?? (req.headers.authorization ?? '').replace('Bearer ', '');
    try { req.user = this.jwt.verify(token, { secret: process.env.JWT_ACCESS_SECRET }); return true; }
    catch { throw new UnauthorizedException(); }
  }
}
