'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Alert, Field } from '@/components/ui';
import { ICopy, IWhatsapp, IPlus, IMinus } from '@/components/Icons';
import { fcfa } from '@/lib/config';

const MIN = 2000, PAS = 500;
export default function Referral() {
  const [s, setS] = useState<{ code: string; balance: number; filleulsActifs: number; rate: number } | null>(null);
  const [montant, setMontant] = useState(MIN); const [op, setOp] = useState<'ORANGE_MONEY' | 'MOOV_MONEY'>('ORANGE_MONEY'); const [tel, setTel] = useState('');
  const [msg, setMsg] = useState<{ k: 'ok' | 'err'; t: string } | null>(null); const [copie, setCopie] = useState(false);
  const load = () => api('/referral/summary').then(setS).catch(() => {}); useEffect(() => { load(); }, []);
  if (!s) return <div className="meter" aria-busy><i style={{ width: '40%' }} /></div>;
  const lien = `${location.origin}/inscription?parrain=${s.code}`;
  async function retirer() {
    try { await api('/withdrawals', { method: 'POST', body: JSON.stringify({ amount: montant, operator: op, phone: tel }) }); setMsg({ k: 'ok', t: 'Demande enregistrée. Vous recevrez votre retrait par Mobile Money.' }); load(); }
    catch (e: any) { setMsg({ k: 'err', t: e.message }); }
  }
  return (<div className="stack-6">
    <h1>Parrainage et gains</h1>
    <section className="card card-or stack-3">
      <p className="muted small">Votre code parrain</p>
      <div className="row between"><b style={{ fontFamily: 'var(--f-titre)', fontSize: 'var(--t-xl)', whiteSpace: 'nowrap' }}>{s.code}</b>
        <button className="btn btn-secondary btn-sm" onClick={() => { navigator.clipboard?.writeText(s.code); setCopie(true); }}><ICopy size={18} />{copie ? 'Copié' : 'Copier'}</button></div>
      <p className="small">Vous gagnez {Math.round(s.rate * 100)} % du montant payé par chaque filleul dont l'inscription est validée.</p>
      <a className="btn btn-primary btn-block" href={`https://wa.me/?text=${encodeURIComponent('Prépare ton concours avec BURKINDI Formations : ' + lien)}`}><IWhatsapp size={20} />Partager sur WhatsApp</a>
    </section>
    <div className="grid-2"><div className="tile"><b>{fcfa(s.balance)}</b><span>Solde disponible</span></div><div className="tile"><b>{s.filleulsActifs}</b><span>Filleuls actifs</span></div></div>
    <section className="card stack-4"><h2 style={{ fontSize: 'var(--t-md)' }}>Retirer mes gains</h2>
      <div role="radiogroup" aria-label="Opérateur" className="grid-2">
        {([['ORANGE_MONEY', 'Orange Money'], ['MOOV_MONEY', 'Moov Money']] as const).map(([v, l]) => <button key={v} type="button" role="radio" aria-checked={op === v} className="choice" onClick={() => setOp(v)}><span className="choice-radio" /><b>{l}</b></button>)}</div>
      <Field id="tel" label="Numéro qui reçoit l'argent"><input id="tel" className="input" type="tel" inputMode="tel" value={tel} onChange={e => setTel(e.target.value)} /></Field>
      <div className="field"><span className="label" id="mt">Montant</span>
        <div className="row" aria-labelledby="mt"><button className="btn btn-secondary" aria-label="Diminuer de 500 FCFA" disabled={montant <= MIN} onClick={() => setMontant(m => m - PAS)}><IMinus /></button>
          <output className="grow center" style={{ font: '800 var(--t-lg) var(--f-titre)' }}>{fcfa(montant)}</output>
          <button className="btn btn-secondary" aria-label="Augmenter de 500 FCFA" disabled={montant + PAS > s.balance} onClick={() => setMontant(m => m + PAS)}><IPlus /></button></div>
        <span className="hint">Minimum {fcfa(MIN)}, par tranches de {fcfa(PAS)}.</span></div>
      {msg && <Alert kind={msg.k}>{msg.t}</Alert>}
      <button className="btn btn-primary btn-block" disabled={!tel || s.balance < MIN || montant > s.balance} onClick={retirer}>Demander le retrait</button>
      {s.balance < MIN && <p className="hint">Il vous faut au moins {fcfa(MIN)} de solde pour retirer.</p>}
    </section>
  </div>);
}
