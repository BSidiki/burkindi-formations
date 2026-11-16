'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { getDeviceHash } from '@/lib/device';
import { Logo } from '@/components/Logo';
import { Alert, Field } from '@/components/ui';

const AIDE: Record<string, string> = {
  'Compte en attente de validation du paiement': 'Votre compte n\'est pas encore activé. Envoyez votre preuve de paiement sur WhatsApp : nous l\'activons rapidement.',
  'Identifiants invalides': 'Numéro ou mot de passe incorrect. Vérifiez votre saisie et réessayez.',
};
export default function LearnerLogin() {
  const [telephone, setT] = useState(''); const [password, setP] = useState(''); const [voir, setVoir] = useState(false);
  const [err, setErr] = useState(''); const [info, setInfo] = useState(''); const [busy, setBusy] = useState(false);
  useEffect(() => { if (new URLSearchParams(location.search).get('reason') === 'autre-appareil') setInfo('Vous avez été déconnecté : votre compte vient d\'être ouvert sur un autre appareil.'); }, []);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setErr(''); setBusy(true);
    try { await api('/auth/learner/login', { method: 'POST', body: JSON.stringify({ telephone, password, deviceHash: await getDeviceHash() }) }); location.href = '/apprenant'; }
    catch (x: any) { setErr(AIDE[x.message] ?? x.message); setBusy(false); }
  }
  return (<main className="auth stack-6">
    <Link href="/" aria-label="Accueil"><Logo height={64} /></Link>
    <h1>Connexion</h1>
    {info && <Alert>{info}</Alert>}
    <form className="stack-4" onSubmit={submit}>
      <Field id="tel" label="Numéro de téléphone"><input id="tel" className="input" type="tel" inputMode="tel" autoComplete="username" required value={telephone} onChange={e => setT(e.target.value)} /></Field>
      <Field id="mdp" label="Mot de passe"><div className="row"><input id="mdp" className="input grow" required type={voir ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={e => setP(e.target.value)} />
        <button type="button" className="btn btn-ghost" onClick={() => setVoir(!voir)}>{voir ? 'Masquer' : 'Afficher'}</button></div></Field>
      {err && <Alert kind="err">{err}</Alert>}
      <button className="btn btn-primary btn-block" disabled={busy}>{busy ? 'Connexion…' : 'Me connecter'}</button>
    </form>
    <p className="center muted">Pas encore de compte ? <Link href="/inscription">Créer mon compte</Link></p>
  </main>);
}
