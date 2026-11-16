import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';

export const clientIp = (req: any): string => (req.headers['x-real-ip'] as string) ?? req.ip;

@Injectable()
export class IpWhitelistGuard implements CanActivate {
  private allowed = (process.env.ADMIN_ALLOWED_IPS ?? '').split(',').map(s => s.trim()).filter(Boolean);
  canActivate(ctx: ExecutionContext) {
    if (!this.allowed.includes(clientIp(ctx.switchToHttp().getRequest()))) throw new ForbiddenException('IP non autorisée');
    return true;
  }
}
