// Données de DÉMONSTRATION pour le développement local uniquement (npm run local:seed).
// Crée un apprenant actif et quelques questions d'exemple. Ne pas exécuter en production.
import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';
const prisma = new PrismaClient();

const CONCOURS = 'Contrôleurs du Trésor';
const QUESTIONS: { matiere: string; enonce: string; options: string[]; correctIndex: number; explication: string }[] = [
  { matiere: 'Mathématiques', enonce: 'Un article coûte 12 000 FCFA. Son prix augmente de 15 %. Quel est le nouveau prix ?',
    options: ['12 150 FCFA', '13 200 FCFA', '13 800 FCFA', '14 000 FCFA'], correctIndex: 2,
    explication: '15 % de 12 000 = 1 800 ; 12 000 + 1 800 = 13 800 FCFA.' },
  { matiere: 'Mathématiques', enonce: 'À quel pourcentage correspond la fraction 3/4 ?',
    options: ['34 %', '43 %', '70 %', '75 %'], correctIndex: 3,
    explication: '3 ÷ 4 = 0,75, soit 75 %.' },
  { matiere: 'Mathématiques', enonce: 'Combien de côtés possède un hexagone ?',
    options: ['5', '6', '7', '8'], correctIndex: 1,
    explication: 'Un hexagone est un polygone à 6 côtés.' },
  { matiere: 'Français', enonce: 'Quel est le pluriel du mot « cheval » ?',
    options: ['chevals', 'chevaux', 'chevaus', 'cheveaux'], correctIndex: 1,
    explication: 'Les noms en -al font généralement leur pluriel en -aux : un cheval, des chevaux.' },
  { matiere: 'Français', enonce: 'Lequel de ces mots est un synonyme de « rapide » ?',
    options: ['lent', 'véloce', 'pesant', 'tardif'], correctIndex: 1,
    explication: '« Véloce » signifie rapide ; les trois autres mots expriment la lenteur ou le retard.' },
  { matiere: 'Culture générale', enonce: 'Quelle est la capitale du Burkina Faso ?',
    options: ['Bobo-Dioulasso', 'Koudougou', 'Ouagadougou', 'Banfora'], correctIndex: 2,
    explication: 'Ouagadougou est la capitale du Burkina Faso.' },
];

async function main() {
  const concours = await prisma.concours.findUniqueOrThrow({ where: { nom: CONCOURS } });
  for (const q of QUESTIONS) {
    const existe = await prisma.question.findFirst({ where: { concoursId: concours.id, enonce: q.enonce } });
    if (!existe) await prisma.question.create({ data: { ...q, concoursId: concours.id } });
  }
  const telephone = '+22670000001';
  await prisma.user.upsert({
    where: { telephone }, update: {},
    create: {
      nom: 'Démo', prenom: 'Apprenant', telephone,
      passwordHash: await argon2.hash('Demo!2026', { type: argon2.argon2id }),
      role: 'APPRENANT', statut: 'ACTIF', voie: 'DIRECT', niveau: 'BAC', referralCode: 'BURK-DEMO',
      concours: { connect: { id: concours.id } },
    },
  });
  console.log(`Données locales prêtes : apprenant ${telephone} / Demo!2026, ${QUESTIONS.length} questions d'exemple.`);
}
main().finally(() => prisma.$disconnect());
