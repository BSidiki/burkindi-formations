// Clé AES-GCM 256 non extractible, conservée dans IndexedDB (CryptoKey structurée-clonable).
import Dexie from 'dexie';
const keyDb = new Dexie('burkindi-keys'); keyDb.version(1).stores({ keys: 'id' });

async function getKey(): Promise<CryptoKey> {
  const t = (keyDb as any).table('keys');
  const row = await t.get('main');
  if (row) return row.key;
  const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
  await t.put({ id: 'main', key });
  return key;
}
export async function encryptJson(data: unknown) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const buf = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await getKey(), new TextEncoder().encode(JSON.stringify(data)));
  return { iv: Array.from(iv), data: new Uint8Array(buf) };
}
export async function decryptJson<T>(p: { iv: number[]; data: Uint8Array }): Promise<T> {
  const buf = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: new Uint8Array(p.iv) }, await getKey(), p.data as BufferSource);
  return JSON.parse(new TextDecoder().decode(buf));
}
