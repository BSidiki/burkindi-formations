import Dexie, { Table } from 'dexie';
import { api } from '../api';
import { encryptJson, decryptJson } from './crypto';

export interface QueueItem { id?: number; kind: 'EXAM' | 'FEEDBACK'; iv: number[]; data: Uint8Array; createdAt: number }
export interface Pack { id: string; titre: string; iv: number[]; data: Uint8Array; sizeBytes: number }

class OfflineDB extends Dexie {
  queue!: Table<QueueItem, number>;
  packs!: Table<Pack, string>;
  constructor() { super('burkindi'); this.version(1).stores({ queue: '++id, kind, createdAt', packs: 'id' }); }
}
export const db = new OfflineDB();
export const QUOTA_BYTES = 100 * 1024 * 1024;

export async function enqueue(kind: QueueItem['kind'], payload: unknown) {
  const e = await encryptJson(payload);
  await db.queue.add({ kind, iv: e.iv, data: e.data, createdAt: Date.now() });
}
export async function storePack(id: string, titre: string, content: unknown) {
  const e = await encryptJson(content);
  const used = (await db.packs.toArray()).reduce((s, p) => s + p.sizeBytes, 0);
  if (used + e.data.byteLength > QUOTA_BYTES) throw new Error('Quota hors ligne (100 Mo) dépassé');
  await db.packs.put({ id, titre, iv: e.iv, data: e.data, sizeBytes: e.data.byteLength });
}
export const readPack = async (id: string) => { const p = await db.packs.get(id); return p ? decryptJson<any>(p) : null; };

/** Synchronisation au retour du réseau : copies d'examens et feedbacks rédigés hors ligne. */
export async function syncQueue() {
  for (const it of await db.queue.orderBy('createdAt').toArray()) {
    const payload = await decryptJson<any>(it);
    try {
      await api(it.kind === 'EXAM' ? '/exams/submit' : '/feedbacks', { method: 'POST', body: JSON.stringify(payload) });
      await db.queue.delete(it.id!);
    } catch { break; }  // réseau instable : on réessaiera
  }
}
if (typeof window !== 'undefined') window.addEventListener('online', () => { syncQueue(); });
