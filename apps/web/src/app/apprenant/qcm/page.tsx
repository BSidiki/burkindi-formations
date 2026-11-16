'use client';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { enqueue } from '@/lib/offline/db';
import { useExamGuard } from '@/hooks/useExamGuard';
import { Alert, Field } from '@/components/ui';
import { ICheck, IX, IAlert } from '@/components/Icons';

type Q = { id: string; matiere: string; enonce: string; options: string[]; publicNote?: string | null };
type Corr = { correct: boolean; correctIndex: number; explication: string; publicNote?: string | null };
const LETTRES = ['A', 'B', 'C', 'D', 'E'];
const MOTIFS = ['Erreur dans la correction', 'Énoncé peu clair', 'Faute de langue', 'Autre problème'];
const mmss = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

export default function Qcm() {
  const [phase, setPhase] = useState<'choix' | 'question' | 'fin'>('choix'); const [mode, setMode] = useState<'REVISION' | 'EXAMEN_BLANC'>('REVISION');
  const [qs, setQs] = useState<Q[]>([]); const [i, setI] = useState(0); const [rep, setRep] = useState<Record<string, number>>({}); const [corr, setCorr] = useState<Record<string, Corr>>({});
  const [lost, setLost] = useState(0); const [sec, setSec] = useState(0); const [hors, setHors] = useState(false); const [fin, setFin] = useState('');
  const [signal, setSignal] = useState(false); const [motif, setMotif] = useState(MOTIFS[0]); const [texte, setTexte] = useState(''); const [envoye, setEnvoye] = useState(false);
  useEffect(() => { api('/exams/questions').then(setQs).catch(() => {}); }, []);
  useEffect(() => { if (phase !== 'question') return; const t = setInterval(() => setSec(s => s + 1), 1000); return () => clearInterval(t); }, [phase]);
  useExamGuard(mode === 'EXAMEN_BLANC' && phase === 'question', useCallback((n: number) => setLost(n), []));
  const q = qs[i]; const exam = mode === 'EXAMEN_BLANC';

  async function choisir(idx: number) {
    if (!exam && corr[q.id]) return;
    setRep(r => ({ ...r, [q.id]: idx }));
    if (!exam) { const r = await api(`/exams/questions/${q.id}/answer`, { method: 'POST', body: JSON.stringify({ index: idx }) }); setCorr(cc => ({ ...cc, [q.id]: r })); }
  }
  async function terminer() {
    if (exam) {
      const body = { mode, answers: rep, durationSec: sec, focusLossCount: Math.max(lost, 0) };
      if (navigator.onLine) { await api('/exams/submit', { method: 'POST', body: JSON.stringify(body) }); setFin('Votre copie a été envoyée. La note apparaîtra sur votre tableau de bord dans quelques instants.'); }
      else { await enqueue('EXAM', body); setFin('Vous êtes hors ligne : votre copie est enregistrée sur votre téléphone et sera envoyée dès le retour du réseau.'); setHors(true); }
    } else { const bons = Object.values(corr).filter(c => c.correct).length; setFin(`Session terminée : ${bons} bonne${bons > 1 ? 's' : ''} réponse${bons > 1 ? 's' : ''} sur ${qs.length}.`); }
    setPhase('fin');
  }
  async function envoyerSignalement() { try { await api('/feedbacks', { method: 'POST', body: JSON.stringify({ questionId: q.id, motif, message: texte }) }); } catch {} setEnvoye(true); setSignal(false); setTexte(''); }
  function demarrer(m: typeof mode) { setMode(m); setI(0); setRep({}); setCorr({}); setLost(0); setSec(0); setEnvoye(false); setPhase('question'); }

  if (phase === 'choix') return (<div className="stack-6">
    <h1>Que voulez-vous faire ?</h1>
    {!qs.length && <Alert>Aucune question disponible pour vos concours pour le moment.</Alert>}
    <div className="stack-3">
      <button className="choice" disabled={!qs.length} onClick={() => demarrer('REVISION')}><span><b>Révision libre</b><br /><span className="muted">Vous voyez la correction et l'explication après chaque réponse. Prenez votre temps.</span></span></button>
      <button className="choice" disabled={!qs.length} onClick={() => demarrer('EXAMEN_BLANC')}><span><b>Examen blanc</b><br /><span className="muted">Chronométré, sans correction pendant l'épreuve. Chaque sortie de l'écran est enregistrée.</span></span></button>
    </div></div>);

  if (phase === 'fin') return (<div className="stack-6"><Alert kind="ok"><div><b>{fin}</b></div></Alert>
    <Link className="btn btn-primary btn-block" href="/apprenant">Voir ma trajectoire</Link><button className="btn btn-secondary btn-block" onClick={() => setPhase('choix')}>Refaire une session</button></div>);

  const c = corr[q.id]; const choix = rep[q.id];
  return (<div className="stack-4">
    <div className="row between"><p className="small muted">Question {i + 1} sur {qs.length} · {q.matiere}</p>{exam && <span className="timer" aria-label="Temps écoulé">{mmss(sec)}</span>}</div>
    <div className="steps" aria-hidden>{qs.map((x, k) => <i key={x.id} className={k <= i ? 'on' : ''} />)}</div>
    {exam && lost > 0 && <Alert kind="err"><b>Vous avez quitté l'écran {lost} fois.</b> Ces sorties sont enregistrées dans votre dossier.</Alert>}
    <section className="card card-papier stack-4"><p className="sheet-q">{q.enonce}</p>
      <div className="opts" role="group" aria-label="Réponses possibles">
        {q.options.map((o, k) => { const etat = c ? (k === c.correctIndex ? 'ok' : k === choix ? 'ko' : '') : '';
          return <button key={k} className={`opt ${etat ? 'opt-' + etat : ''}`} aria-pressed={choix === k && !c} onClick={() => choisir(k)} disabled={!exam && !!c}>
            <span className="bubble">{etat === 'ok' ? <ICheck size={22} /> : etat === 'ko' ? <IX size={22} /> : LETTRES[k]}</span><span>{o}</span>
            {etat === 'ok' && <span className="opt-state">Bonne réponse</span>}{etat === 'ko' && <span className="opt-state">Votre réponse</span>}</button>; })}
      </div></section>
    {c && <Alert kind={c.correct ? 'ok' : 'err'}><div><b>{c.correct ? 'Bravo, c\'est correct.' : 'Ce n\'est pas la bonne réponse.'}</b><br />{c.explication}{c.publicNote && <><br /><i>{c.publicNote}</i></>}</div></Alert>}
    {envoye && <Alert kind="ok">Merci, votre signalement est envoyé à l'équipe.</Alert>}
    {signal ? <div className="card stack-3"><Field id="motif" label="Quel est le problème ?"><select id="motif" className="select" value={motif} onChange={e => setMotif(e.target.value)}>{MOTIFS.map(m => <option key={m}>{m}</option>)}</select></Field>
        <Field id="txt" label="Expliquez en quelques mots"><textarea id="txt" className="textarea" value={texte} onChange={e => setTexte(e.target.value)} /></Field>
        <div className="row"><button className="btn btn-secondary" onClick={() => setSignal(false)}>Annuler</button><button className="btn btn-primary grow" disabled={!texte.trim()} onClick={envoyerSignalement}>Envoyer le signalement</button></div></div>
      : <button className="btn btn-ghost" onClick={() => setSignal(true)}><IAlert size={18} />Signaler un problème sur cette question</button>}
    <div className="bar-bas">
      <button className="btn btn-secondary" disabled={i === 0} onClick={() => setI(i - 1)}>Précédent</button>
      {i < qs.length - 1 ? <button className="btn btn-primary grow" onClick={() => setI(i + 1)}>Question suivante</button>
        : <button className="btn btn-primary grow" onClick={terminer}>{exam ? 'Envoyer ma copie' : 'Terminer la session'}</button>}
    </div>
  </div>);
}
