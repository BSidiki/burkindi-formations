'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useMe } from '@/hooks/useMe';
import { Trajectory } from '@/components/Trajectory';
import { InstallPrompt } from '@/components/InstallPrompt';

export default function Dashboard() {
  const me = useMe(); const [s, setS] = useState<{ moyennePct: number; sessions: { at: string; score: number }[] } | null | undefined>(undefined);
  useEffect(() => { api('/exams/stats').then(setS).catch(() => setS(null)); }, []);
  const scores = s?.sessions.map(x => x.score) ?? [];
  return (<div className="stack-6">
    <h1>Bonjour{me ? ` ${me.prenom}` : ''}</h1>
    <section className="card stack-3" aria-labelledby="t-traj">
      <h2 id="t-traj" style={{ fontSize: 'var(--t-md)' }}>Votre trajectoire</h2>
      {s === undefined ? <div className="meter" aria-busy><i style={{ width: '40%' }} /></div>
        : scores.length ? <Trajectory scores={scores} labels={s!.sessions.map(x => new Date(x.at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }))} objective={70} />
        : <p className="muted">Aucune session pour l'instant. Faites un premier QCM : votre courbe commencera ici.</p>}
    </section>
    {scores.length > 0 && <div className="grid-2" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
      <div className="tile"><b>{s!.moyennePct} %</b><span>Moyenne</span></div>
      <div className="tile"><b>{scores[scores.length - 1]} %</b><span>Dernière</span></div>
      <div className="tile"><b>{Math.max(...scores)} %</b><span>Meilleure</span></div></div>}
    <Link className="btn btn-primary btn-block" href="/apprenant/qcm">{scores.length ? 'Continuer mes révisions' : 'Commencer un QCM'}</Link>
    <InstallPrompt />
  </div>);
}
