import { BadRequestException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { authenticator } from 'otplib';
import { randomBytes, randomUUID } from 'crypto';
import { Response } from 'express';
import { PrismaService } from '../../prisma/prisma.module';
import { RedisService } from '../../common/redis.service';
import { SessionsService } from '../sessions/sessions.service';
import { SecurityService } from '../security/security.service';
import { FidoService } from './fido.service';
const cfg = require('@burkindi/config');

const COOKIE = { httpOnly: true, secure: true, sameSite: 'strict' as const, path: '/', domain: process.env.COOKIE_DOMAIN || undefined };

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService, private redis: RedisService,
              private sessions: SessionsService, private security: SecurityService, private fido: FidoService) {}

  async register(b: { nom: string; prenom: string; telephone: string; email?: string; password: string;
                      voie: 'DIRECT' | 'PROFESSIONNEL'; niveau: string; concours: string[];
                      referralCode?: string; operator?: string; reference?: string }) {
    if (!b.password || b.password.length < 8) throw new BadRequestException('Mot de passe trop court');
    if (!b.concours?.length) throw new BadRequestException('Choisissez au moins un concours');
    const parrain = b.referralCode ? await this.prisma.user.findUnique({ where: { referralCode: b.referralCode } }) : null;
    if (b.referralCode && !parrain) throw new BadRequestException('Code parrain inconnu');
    const user = await this.prisma.user.create({
      data: {
        nom: b.nom, prenom: b.prenom, telephone: b.telephone, email: b.email || null,
        passwordHash: await argon2.hash(b.password, { type: argon2.argon2id }),
        voie: b.voie, niveau: b.niveau, statut: 'EN_ATTENTE',
        referralCode: 'BURK-' + randomBytes(2).toString('hex').toUpperCase(),
        referredById: parrain?.id,
        concours: { connect: b.concours.map(nom => ({ nom })) },
        payments: { create: { amount: cfg.subscriptionPrice[b.voie], operator: b.operator ?? 'ORANGE_MONEY', reference: b.reference } },
      },
      select: { id: true, referralCode: true, statut: true },
    });
    return user; // le compte reste EN_ATTENTE jusqu'à validation du paiement WhatsApp par l'admin
  }

  concours(voie?: string) {
    return this.prisma.concours.findMany({ where: voie ? { voie: voie as any } : {}, select: { id: true, nom: true, voie: true }, orderBy: { nom: 'asc' } });
  }

  async checkReferral(code: string) {
    const p = await this.prisma.user.findUnique({ where: { referralCode: code }, select: { prenom: true, nom: true } });
    return { valid: !!p, parrain: p ? `${p.prenom} ${p.nom}` : null };
  }

  private async tooManyFailures(scope: string, ip: string, id: string) {
    const n = await this.redis.hit(`fail:${scope}:${ip}:${id}`, 900);
    return n > cfg.loginMaxAttempts;
  }

  async learnerLogin(b: { telephone: string; password: string; deviceHash: string }, ip: string, res: Response) {
    if (await this.tooManyFailures('learner', ip, b.telephone)) {
      await this.security.log('LOGIN_BRUTE_FORCE', `Trop d'échecs pour ${b.telephone}`, { ip, deviceHash: b.deviceHash });
      throw new ForbiddenException('Trop de tentatives, réessayez dans 15 minutes');
    }
    const u = await this.prisma.user.findUnique({ where: { telephone: b.telephone } });
    if (!u || u.role !== 'APPRENANT' || !(await argon2.verify(u.passwordHash, b.password)))
      throw new UnauthorizedException('Identifiants invalides');
    if (u.statut === 'EN_ATTENTE') throw new ForbiddenException('Compte en attente de validation du paiement');
    if (u.statut === 'SUSPENDU') throw new ForbiddenException('Compte suspendu : contactez l\'administration');
    await this.sessions.open(u.id, b.deviceHash, ip);
    await this.issue(u.id, u.role, res);
    return { ok: true };
  }

  async adminLogin(b: { email: string; password: string; totp: string; deviceHash: string; fido?: unknown }, ip: string, res: Response) {
    const u = await this.prisma.user.findUnique({ where: { email: b.email } });
    const ok = !!u && u.role === 'ADMIN' && await argon2.verify(u.passwordHash, b.password);
    const totpOk = ok && !!u!.totpSecret && authenticator.check(b.totp ?? '', u!.totpSecret!);
    if (!ok || !totpOk || !(await this.fido.verify(u!.id, b.fido))) {
      await this.security.log('ADMIN_2FA_FAILED', `Échec connexion admin (${b.email})`, { ip, deviceHash: b.deviceHash });
      throw new UnauthorizedException('Accès refusé');
    }
    await this.issue(u!.id, 'ADMIN', res);
    return { ok: true };
  }

  /** Access JWT court + refresh JWT rotatif (jti stocké dans Redis : un seul refresh valide par utilisateur). */
  private async issue(userId: string, role: string, res: Response) {
    const jti = randomUUID();
    const days = Number(process.env.REFRESH_TTL_DAYS ?? 30);
    await this.redis.set(`refresh:${userId}`, jti, 'EX', days * 86400);
    res.cookie('access', this.jwt.sign({ sub: userId, role }, { secret: process.env.JWT_ACCESS_SECRET, expiresIn: process.env.ACCESS_TTL ?? '15m' }),
      { ...COOKIE, maxAge: 15 * 60_000 });
    res.cookie('refresh', this.jwt.sign({ sub: userId, role, jti }, { secret: process.env.JWT_REFRESH_SECRET, expiresIn: `${days}d` }),
      { ...COOKIE, path: process.env.REFRESH_COOKIE_PATH ?? '/auth/refresh', maxAge: days * 86400_000 });
  }

  async refresh(req: any, res: Response) {
    try {
      const p = this.jwt.verify(req.cookies?.refresh, { secret: process.env.JWT_REFRESH_SECRET });
      if ((await this.redis.get(`refresh:${p.sub}`)) !== p.jti) throw new Error('révoqué');
      const u = await this.prisma.user.findUniqueOrThrow({ where: { id: p.sub } });
      if (u.statut !== 'ACTIF') throw new Error('inactif');
      await this.issue(u.id, u.role, res);
      return { ok: true };
    } catch { throw new UnauthorizedException(); }
  }

  async me(id: string, ip: string) {
    const u = await this.prisma.user.findUniqueOrThrow({ where: { id } });
    return { id: u.id, role: u.role, nom: u.nom, prenom: u.prenom, voie: u.voie,
             watermark: { name: `${u.prenom} ${u.nom}`, phone: u.telephone, ip } };
  }
}
