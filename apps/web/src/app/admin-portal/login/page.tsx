'use client';
import { useState } from 'react';
import { api } from '@/lib/api';
import { getDeviceHash } from '@/lib/device';
import { Logo } from '@/components/Logo';
import { Alert, Field } from '@/components/ui';

export default function AdminLogin() {
  const [f, setF] = useState({ email: '', password: '', totp: '' }); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setErr(''); setBusy(true);
    try { await api('/auth/admin/login', { method: 'POST', body: JSON.stringify({ ...f, deviceHash: await getDeviceHash() }) }); location.href = '/admin-portal'; }
    catch { setErr('Accès refusé. Vérifiez vos identifiants, votre code à 6 chiffres et que vous êtes sur un réseau autorisé.'); setBusy(false); }
  }
  return (<main className="auth stack-6"><Logo height={64} /><h1>Back-office</h1>
    <form className="stack-4" onSubmit={submit}>
      <Field id="mail" label="E-mail"><input id="mail" className="input" type="email" autoComplete="username" required onChange={e => setF({ ...f, email: e.target.value })} /></Field>
      <Field id="mdp" label="Mot de passe"><input id="mdp" className="input" type="password" autoComplete="current-password" required onChange={e => setF({ ...f, password: e.target.value })} /></Field>
      <Field id="otp" label="Code à 6 chiffres" hint="Affiché dans votre application d'authentification."><input id="otp" className="input" inputMode="numeric" autoComplete="one-time-code" maxLength={6} required onChange={e => setF({ ...f, totp: e.target.value })} /></Field>
      {err && <Alert kind="err">{err}</Alert>}
      <button className="btn btn-primary btn-block" disabled={busy}>{busy ? 'Vérification…' : 'Ouvrir le back-office'}</button>
    </form></main>);
}
