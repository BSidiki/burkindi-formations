import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.module';
import { AlertsService } from '../notifications/alerts.service';
import type { SecurityEventType } from '@burkindi/shared-types';

const ALERTING: SecurityEventType[] = ['LOGIN_BRUTE_FORCE', 'ADMIN_IP_REFUSED', 'ADMIN_2FA_FAILED', 'MULTI_DEVICE_BLOCKED'];

@Injectable()
export class SecurityService {
  constructor(private prisma: PrismaService, private alerts: AlertsService) {}
  async log(type: SecurityEventType, details: string, o: { userId?: string; deviceHash?: string; ip?: string } = {}) {
    await this.prisma.securityLog.create({ data: { type, details, ...o } });
    if (ALERTING.includes(type)) await this.alerts.push(type, o.ip ?? '-', details);
  }
}
