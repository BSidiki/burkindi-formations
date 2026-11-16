import { demo } from './demo';
const BASE = process.env.NEXT_PUBLIC_API_URL ?? '';
const DEMO = process.env.NEXT_PUBLIC_DEMO === '1';

export async function api<T = any>(path: string, init: RequestInit = {}): Promise<T> {
  if (DEMO) { await new Promise(r => setTimeout(r, 250)); return demo(path, init); }
  const go = () => fetch(BASE + path, { credentials: 'include', headers: { 'Content-Type': 'application/json' }, ...init });
  let r = await go();
  if (r.status === 401 && !path.startsWith('/auth/')) {           // access expiré : on tente le refresh rotatif
    if ((await fetch(BASE + '/auth/refresh', { method: 'POST', credentials: 'include' })).ok) r = await go();
  }
  if (!r.ok) throw new Error((await r.json().catch(() => ({}))).message ?? `Erreur ${r.status}`);
  return r.json();
}
