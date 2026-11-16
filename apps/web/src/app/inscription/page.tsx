'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { NIVEAUX_DIRECT, NIVEAUX_PRO } from '@burkindi/shared-types';
import { CONTACT, NIVEAU_LABEL, TARIFS, fcfa } from '@/lib/config';
import { Logo } from '@/components/Logo';
import { Alert, Field } from '@/components/ui';
import { IWhatsapp, ICopy, ICheck } from '@/components/Icons';

type Voie = 'DIRECT' | 'PROFESSIONNEL';
export default function Inscription() {
  const [step, setStep] = useState(1);
  const [voie, setVoie] = useState<Voie>('DIRECT'); const [niveau, setNiveau] = useState('');
  const [liste, setListe] = useState<{ id: string; nom: string }[]>([]); const [choisis, setChoisis] = useState<string[]>([]);
  const [f, setF] = useState({ prenom: '', nom: '', telephone: '', email: '', password: '', referralCode: '' });
  const [voir, setVoir] = useState(false); const [parrain, setParrain] = useState<string | null | undefined>(undefined);
  const [err, setErr] = useState(''); const [busy, setBusy] = useState(false); const [compte, setCompte] = useState<{ referralCode: string } | null>(null);
  const [copie, setCopie] = useState(false);
  const niveaux = voie === 'DIRECT' ? NIVEAUX_DIRECT : NIVEAUX_PRO;

  useEffect(() => { const p = new URLSearchParams(location.search).get('parrain'); if (p) checkCode(p); }, []);
  useEffect(() => { setNiveau(''); setChoisis([]); api(`/auth/concours?voie=${voie}`).then(setListe).catch(() => setListe([])); }, [voie]);
  async function checkCode(code: string) {
    setF(x => ({ ...x, referralCode: code })); setParrain(undefined);
    if (code.length >= 8) { try { setParrain((await api(`/auth/referral/${encodeURIComponent(code)}`)).parrain); } catch { setParrain(null); } }
  }
  async function creer(e: React.FormEvent) {
    e.preventDefault(); setErr(''); setBusy(true);
    try {
      const noms = liste.filter(c => choisis.includes(c.id)).map(c => c.nom);
      setCompte(await api('/auth/register', { method: 'POST', body: JSON.stringify({ ...f, email: f.email || undefined, referralCode: f.referralCode || undefined, voie, niveau, concours: noms }) }));
      setStep(4);
    } catch (x: any) { setErr(x.message); } finally { setBusy(false); }
  }
  const montant = TARIFS[voie];
  const msg = encodeURIComponent(`Bonjour, je viens de créer mon compte BURKINDI (${f.prenom} ${f.nom}, ${f.telephone}). Voici ma preuve de paiement de ${fcfa(montant)}.`);

  return (<main className="auth stack-6" style={{ width: 'min(100% - 2rem, 520px)' }}>
    <Link href="/" aria-label="Accueil"><Logo height={60} /></Link>
    {step < 4 && <div className="stack-2"><div className="steps" aria-hidden>{[1, 2, 3].map(n => <i key={n} className={n <= step ? 'on' : ''} />)}</div><p className="small muted">Étape {step} sur 3</p></div>}

    {step === 1 && <section className="stack-4">
      <h1>Quelle est votre voie ?</h1>
      <div role="radiogroup" aria-label="Voie de concours" className="stack-3">
        {([['DIRECT', 'Concours direct', 'CEP, BEPC, baccalauréat, licence, master'], ['PROFESSIONNEL', 'Concours professionnel', 'Agents en poste, catégories A à D']] as const).map(([v, t, d]) => (
          <button key={v} type="button" role="radio" aria-checked={voie === v} className="choice" onClick={() => setVoie(v)}>
            <span className="choice-radio" /><span><b>{t}</b><br /><span className="muted small">{d}</span><br /><b>{fcfa(TARIFS[v])}</b></span></button>))}
      </div>
      <Field id="niveau" label={voie === 'DIRECT' ? 'Votre niveau d\'études' : 'Votre catégorie'}>
        <select id="niveau" className="select" value={niveau} onChange={e => setNiveau(e.target.value)}><option value="">Choisir…</option>{niveaux.map(n => <option key={n} value={n}>{NIVEAU_LABEL[n]}</option>)}</select></Field>
      <button className="btn btn-primary btn-block" disabled={!niveau} onClick={() => setStep(2)}>Continuer</button>
    </section>}

    {step === 2 && <section className="stack-4">
      <h1>Quels concours visez-vous ?</h1><p className="muted">Vous pouvez en choisir plusieurs.</p>
      <div className="stack-3">{liste.map(c => { const on = choisis.includes(c.id);
        return <button key={c.id} type="button" role="checkbox" aria-checked={on} className="choice" onClick={() => setChoisis(on ? choisis.filter(x => x !== c.id) : [...choisis, c.id])}>
          <span className="choice-radio" style={{ borderRadius: 6 }}>{on && <ICheck size={16} />}</span><b>{c.nom}</b></button>; })}
        {!liste.length && <Alert>Chargement de la liste des concours…</Alert>}</div>
      <div className="row"><button className="btn btn-secondary" onClick={() => setStep(1)}>Retour</button><button className="btn btn-primary grow" disabled={!choisis.length} onClick={() => setStep(3)}>Continuer</button></div>
    </section>}

    {step === 3 && <form className="stack-4" onSubmit={creer}>
      <h1>Vos informations</h1>
      <div className="grid-2"><Field id="prenom" label="Prénom(s)"><input id="prenom" className="input" required autoComplete="given-name" value={f.prenom} onChange={e => setF({ ...f, prenom: e.target.value })} /></Field>
        <Field id="nom" label="Nom"><input id="nom" className="input" required autoComplete="family-name" value={f.nom} onChange={e => setF({ ...f, nom: e.target.value })} /></Field></div>
      <Field id="tel" label="Numéro WhatsApp" hint="Nous vous contactons sur ce numéro.">
        <input id="tel" className="input" required type="tel" inputMode="tel" autoComplete="tel" placeholder="+226 70 00 00 00" value={f.telephone} onChange={e => setF({ ...f, telephone: e.target.value })} /></Field>
      <Field id="mail" label="E-mail (facultatif)"><input id="mail" className="input" type="email" autoComplete="email" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} /></Field>
      <Field id="mdp" label="Mot de passe" hint="8 caractères minimum.">
        <div className="row"><input id="mdp" className="input grow" required minLength={8} type={voir ? 'text' : 'password'} autoComplete="new-password" value={f.password} onChange={e => setF({ ...f, password: e.target.value })} />
          <button type="button" className="btn btn-ghost" onClick={() => setVoir(!voir)}>{voir ? 'Masquer' : 'Afficher'}</button></div></Field>
      <Field id="parrain" label="Code parrain (facultatif)" hint={parrain ? `Parrain : ${parrain}` : parrain === null ? 'Ce code n\'existe pas.' : 'Exemple : BURK-7F3A'}>
        <input id="parrain" className="input" value={f.referralCode} onChange={e => checkCode(e.target.value.toUpperCase())} /></Field>
      {err && <Alert kind="err">{err}</Alert>}
      <div className="row"><button type="button" className="btn btn-secondary" onClick={() => setStep(2)}>Retour</button><button className="btn btn-primary grow" disabled={busy}>{busy ? 'Création…' : 'Créer mon compte'}</button></div>
    </form>}

    {step === 4 && compte && <section className="stack-4">
      <Alert kind="ok"><b>Votre compte est créé.</b> Il sera activé dès que nous aurons validé votre paiement.</Alert>
      <h1>Dernière étape : le paiement</h1>
      <div className="card card-or stack-3">
        <p className="prix">{fcfa(montant)}</p>
        <p>Envoyez ce montant par Mobile Money :</p>
        <p><b>Orange Money</b> : {CONTACT.orange}<br /><b>Moov Money</b> : {CONTACT.moov}</p>
      </div>
      <a className="btn btn-primary btn-block" href={`https://wa.me/${CONTACT.whatsapp}?text=${msg}`}><IWhatsapp size={20} />Envoyer la preuve sur WhatsApp</a>
      <div className="card stack-2"><p className="small muted">Votre code parrain : partagez-le, vous gagnez 15 % sur chaque inscription validée.</p>
        <div className="row between"><b style={{ fontFamily: 'var(--f-titre)', fontSize: 'var(--t-xl)' }}>{compte.referralCode}</b>
          <button className="btn btn-secondary btn-sm" onClick={() => { navigator.clipboard?.writeText(compte.referralCode); setCopie(true); }}><ICopy size={18} />{copie ? 'Copié' : 'Copier'}</button></div></div>
      <Link className="btn btn-ghost" href="/apprenant/login">Aller à la connexion</Link>
    </section>}
  </main>);
}
