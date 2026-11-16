import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.module';
import { RedisService } from '../../common/redis.service';
import { SecurityService } from '../security/security.service';
import { SessionsGateway } from './sessions.gateway';
const cfg = require('@burkindi/config');

@Injectable()
export class SessionsService {
  constructor(private prisma: PrismaService, private redis: RedisService,
              private security: SecurityService, private gw: SessionsGateway) {}

  /** Session unique par appareil. Au 3e changement d'appareil du mois : suspension préventive. */
  async open(userId: string, deviceHash: string, ip: string) {
    const u = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    if (u.role === 'APPRENANT' && u.activeDevice && u.activeDevice !== deviceHash) {
      const monthAgo = new Date(Date.now() - 30 * 86400_000);
      const changes = (u.deviceChangesResetAt < monthAgo ? 0 : u.deviceChanges) + 1;
      await this.prisma.user.update({ where: { id: userId },
        data: { deviceChanges: changes, deviceChangesResetAt: u.deviceChangesResetAt < monthAgo ? new Date() : undefined } });
      if (changes >= cfg.deviceChangesBeforeSuspension) {
        await this.prisma.user.update({ where: { id: userId }, data: { statut: 'SUSPENDU' } });
        await this.security.log('MULTI_DEVICE_BLOCKED', `${changes}e changement d'appareil ce mois-ci — suspension préventive`, { userId, deviceHash, ip });
        this.gw.forceLogout(userId);
        throw new ForbiddenException('Compte suspendu : trop de changements d\'appareil');
      }
      await this.security.log('MULTI_DEVICE', 'Connexion depuis un nouvel appareil : ancienne session révoquée', { userId, deviceHash, ip });
      this.gw.forceLogout(userId); // déconnexion immédiate de l'ancien appareil
    }
    await this.prisma.user.update({ where: { id: userId }, data: { activeDevice: deviceHash } });
  }

  /** Action admin : libère l'appareil enregistré. */
  async resetDevice(userId: string) {
    await this.prisma.user.update({ where: { id: userId }, data: { activeDevice: null, deviceChanges: 0 } });
    await this.redis.del(`refresh:${userId}`);
    this.gw.forceLogout(userId);
  }
}
