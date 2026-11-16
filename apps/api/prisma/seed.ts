import { PrismaClient, Voie } from '@prisma/client';
import * as argon2 from 'argon2';
const prisma = new PrismaClient();

const CONCOURS: [string, Voie][] = [
  ["Attachés d'Intendance Scolaire et Universitaire", 'DIRECT'],
  ['Professeurs Certifiés', 'DIRECT'],
  ['Secrétaires Administratifs', 'DIRECT'],
  ['Contrôleurs du Trésor', 'DIRECT'],
  ['Adjoints de Secrétariat', 'DIRECT'],
  ["Attachés d'Administration Scolaire et Universitaire (Pro)", 'PROFESSIONNEL'],
  ['Contrôleurs des Douanes (Pro)', 'PROFESSIONNEL'],
  ['Inspecteurs du Trésor (Pro)', 'PROFESSIONNEL'],
];

async function main() {
  for (const [nom, voie] of CONCOURS) await prisma.concours.upsert({ where: { nom }, update: {}, create: { nom, voie } });
  const email = process.env.SEED_ADMIN_EMAIL ?? 'admin@example.com';
  await prisma.user.upsert({
    where: { email }, update: {},
    create: {
      nom: 'Admin', prenom: 'BURKINDI', telephone: '+22600000000', email,
      passwordHash: await argon2.hash(process.env.SEED_ADMIN_PASSWORD ?? 'ChangeMe!2026', { type: argon2.argon2id }),
      role: 'ADMIN', statut: 'ACTIF', referralCode: 'BURK-ADMIN',
      totpSecret: process.env.SEED_ADMIN_TOTP_SECRET || null,
    },
  });
}
main().finally(() => prisma.$disconnect());
