// Données fictives pour présenter l'interface sans API. Activé par NEXT_PUBLIC_DEMO=1 (npm run demo -w @burkindi/web).
const Q = [
  { id: 'q1', matiere: 'Culture générale', enonce: 'Quelle est la capitale du Burkina Faso ?', options: ['Bobo-Dioulasso', 'Ouagadougou', 'Koudougou', 'Ouahigouya'], c: 1, e: 'Ouagadougou est la capitale politique et administrative du Burkina Faso.' },
  { id: 'q2', matiere: 'Histoire', enonce: "En quelle année la Haute-Volta a-t-elle accédé à l'indépendance ?", options: ['1958', '1960', '1963', '1966'], c: 1, e: "L'indépendance a été proclamée le 5 août 1960." },
  { id: 'q3', matiere: 'Histoire', enonce: 'Depuis quelle année le pays porte-t-il le nom de Burkina Faso ?', options: ['1974', '1980', '1984', '1991'], c: 2, e: 'La Haute-Volta est devenue le Burkina Faso le 4 août 1984.' },
  { id: 'q4', matiere: 'Français', enonce: 'Quel est le pluriel de « un travail » ?', options: ['des travails', 'des travaux', 'des travail', 'des travaus'], c: 1, e: 'Travail fait « travaux » au pluriel.', note: 'Attention : « des travails » existe seulement pour désigner des appareils qui immobilisent les animaux.' },
  { id: 'q5', matiere: 'Mathématiques', enonce: 'Combien font 15 % de 80 000 FCFA ?', options: ['8 000 FCFA', '12 000 FCFA', '15 000 FCFA', '1 200 FCFA'], c: 1, e: '80 000 × 15 / 100 = 12 000.' },
  { id: 'q6', matiere: 'Culture générale', enonce: 'Quelle est la monnaie utilisée au Burkina Faso ?', options: ['Cedi', 'Franc CFA (XOF)', 'Naira', 'Dalasi'], c: 1, e: "Le franc CFA de l'UEMOA (code XOF) a cours au Burkina Faso." },
];
const CONCOURS = [
  { id: 'c1', nom: "Attachés d'Intendance Scolaire et Universitaire", voie: 'DIRECT' }, { id: 'c2', nom: 'Professeurs Certifiés', voie: 'DIRECT' },
  { id: 'c3', nom: 'Secrétaires Administratifs', voie: 'DIRECT' }, { id: 'c4', nom: 'Contrôleurs du Trésor', voie: 'DIRECT' },
  { id: 'c5', nom: 'Contrôleurs des Douanes (Pro)', voie: 'PROFESSIONNEL' }, { id: 'c6', nom: 'Inspecteurs du Trésor (Pro)', voie: 'PROFESSIONNEL' },
];
const ago = (d: number) => new Date(Date.now() - d * 86400000).toISOString();
const STUDENTS = [
  { id: 's1', prenom: 'Awa', nom: 'Ouédraogo', voie: 'DIRECT', niveau: 'LICENCE', statut: 'EN_ATTENTE', payments: [{ id: 'p1', amount: 10000, status: 'EN_ATTENTE' }] },
  { id: 's2', prenom: 'Ibrahim', nom: 'Sawadogo', voie: 'PROFESSIONNEL', niveau: 'CAT_B', statut: 'ACTIF', payments: [{ id: 'p2', amount: 15000, status: 'VALIDE' }] },
  { id: 's3', prenom: 'Fatimata', nom: 'Kaboré', voie: 'DIRECT', niveau: 'BAC', statut: 'ACTIF', payments: [{ id: 'p3', amount: 10000, status: 'VALIDE' }] },
  { id: 's4', prenom: 'Moussa', nom: 'Compaoré', voie: 'DIRECT', niveau: 'BEPC', statut: 'SUSPENDU', payments: [{ id: 'p4', amount: 10000, status: 'VALIDE' }] },
];
export function demo(path: string, init: RequestInit = {}): any {
  const m = init.method ?? 'GET';
  if (path === '/auth/me') return { id: 'u1', role: location.pathname.startsWith('/admin') ? 'ADMIN' : 'APPRENANT', prenom: 'Awa', nom: 'Ouédraogo', voie: 'DIRECT', watermark: { name: 'Awa Ouédraogo', phone: '+226 70 00 00 00', ip: '41.138.0.12' } };
  if (path.startsWith('/auth/concours')) return CONCOURS;
  if (path.startsWith('/auth/referral/')) return { valid: true, parrain: 'Ibrahim Sawadogo' };
  if (path === '/auth/register') return { id: 'u9', referralCode: 'BURK-7F3A', statut: 'EN_ATTENTE' };
  if (path === '/exams/stats') return { moyennePct: 57, sessions: [38, 46, 55, 61, 68, 74].map((score, i) => ({ at: ago(30 - i * 5), score })) };
  if (path === '/exams/questions') return Q.map(({ c, e, ...q }) => q);
  if (/^\/exams\/questions\/.+\/answer$/.test(path)) { const q = Q.find(x => x.id === path.split('/')[3])!; return { correct: JSON.parse(String(init.body)).index === q.c, correctIndex: q.c, explication: q.e, publicNote: (q as any).note ?? null }; }
  if (path === '/exams/focus-loss') return { focusLossCount: 1 };
  if (path === '/referral/summary') return { code: 'BURK-7F3A', balance: 4500, filleulsActifs: 3, rate: 0.15 };
  if (path === '/library') return [{ id: 'r1', titre: 'Annales — Contrôleurs du Trésor (2022 à 2024)' }, { id: 'r2', titre: 'Fiche : droit administratif général' }, { id: 'r3', titre: 'Fiche : finances publiques' }];
  if (path.startsWith('/admin/kpis')) return { inscrits: 1284, actifs: 1102, paiementsEnAttente: 14, alertes24h: 6, retraitsDemandes: 87500 };
  if (path.startsWith('/admin/students')) return STUDENTS;
  if (path === '/admin/feedbacks') return [
    { id: 'f1', motif: 'Erreur dans la correction', message: "Je pense que la réponse B est aussi valable, l'énoncé ne précise pas la date.", statut: 'EN_ATTENTE', user: { prenom: 'Awa', nom: 'Ouédraogo' } },
    { id: 'f2', motif: 'Énoncé peu clair', message: "Il manque l'unité dans la question 14.", statut: 'REPONDU', user: { prenom: 'Fatimata', nom: 'Kaboré' } }];
  if (path === '/admin/security-logs') return [
    { id: 'l1', createdAt: ago(0.02), type: 'FOCUS_LOST', user: { prenom: 'Moussa', nom: 'Compaoré' }, deviceHash: 'a91f03c2e7b4', details: 'Sortie de fenêtre pendant un examen blanc (3e fois)' },
    { id: 'l2', createdAt: ago(0.3), type: 'MULTI_DEVICE', user: { prenom: 'Awa', nom: 'Ouédraogo' }, deviceHash: '5be20d91aa10', details: 'Connexion depuis un nouvel appareil : ancienne session révoquée' },
    { id: 'l3', createdAt: ago(1.1), type: 'LOGIN_BRUTE_FORCE', user: null, deviceHash: null, details: "Trop d'échecs pour +22670000000" }];
  return m === 'GET' ? [] : { ok: true };
}
