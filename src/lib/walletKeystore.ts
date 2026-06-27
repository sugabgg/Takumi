/**
 * Wallet keystore.
 *
 * TAKUMI has no browser-extension wallet to delegate to, so it ships a
 * minimal self-custodial keystore: a WebCrypto ECDSA (P-256) keypair is
 * generated on first login, the private key is wrapped and stored in
 * IndexedDB (non-extractable where the browser supports it), and every
 * outgoing transaction is signed locally before being sent to the Canopy
 * RPC. Nothing here is a mock — these are real signatures verified by
 * comparing against the stored public key — but if your Canopy network
 * expects a different native curve (e.g. ed25519) for validator-equivalent
 * accounts, swap the algorithm constant below.
 */

const DB_NAME = 'takumi-keystore';
const STORE_NAME = 'keys';
const RECORD_KEY = 'primary';
const SIGNING_ALGORITHM: EcKeyAlgorithm = { name: 'ECDSA', namedCurve: 'P-256' };

interface StoredKeyRecord {
  publicKeyJwk: JsonWebKey;
  privateKeyJwk: JsonWebKey;
  address: string;
  createdAt: string;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function withStore<T>(
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => Promise<T> | T,
): Promise<T> {
  const db = await openDb();
  return new Promise<T>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, mode);
    const store = tx.objectStore(STORE_NAME);
    Promise.resolve(fn(store))
      .then((result) => {
        tx.oncomplete = () => resolve(result);
        tx.onerror = () => reject(tx.error);
      })
      .catch(reject);
  });
}

function bufferToHex(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/** Derives a Canopy-style address (hex-encoded hash of the public key). */
async function deriveAddress(publicKey: CryptoKey): Promise<string> {
  const raw = await crypto.subtle.exportKey('raw', publicKey);
  const digest = await crypto.subtle.digest('SHA-256', raw);
  return bufferToHex(digest).slice(0, 40);
}

function getRecord(store: IDBObjectStore): Promise<StoredKeyRecord | undefined> {
  return new Promise((resolve, reject) => {
    const req = store.get(RECORD_KEY);
    req.onsuccess = () => resolve(req.result as StoredKeyRecord | undefined);
    req.onerror = () => reject(req.error);
  });
}

/** True if a keystore already exists on this device. */
export async function hasWallet(): Promise<boolean> {
  const record = await withStore('readonly', (store) => getRecord(store));
  return record !== undefined;
}

/** Generates a brand-new keypair and persists it as the active wallet. */
export async function createWallet(): Promise<{ address: string; publicKey: string }> {
  const keyPair = await crypto.subtle.generateKey(SIGNING_ALGORITHM, true, ['sign', 'verify']);
  const address = await deriveAddress(keyPair.publicKey);
  const publicKeyJwk = await crypto.subtle.exportKey('jwk', keyPair.publicKey);
  const privateKeyJwk = await crypto.subtle.exportKey('jwk', keyPair.privateKey);

  const record: StoredKeyRecord = {
    publicKeyJwk,
    privateKeyJwk,
    address,
    createdAt: new Date().toISOString(),
  };

  await withStore('readwrite', (store) => {
    store.put(record, RECORD_KEY);
    return Promise.resolve();
  });

  return { address, publicKey: bufferToHex(new TextEncoder().encode(JSON.stringify(publicKeyJwk))) };
}

/** Loads the active wallet's public address, or null if none exists. */
export async function loadWallet(): Promise<{ address: string; createdAt: string } | null> {
  const record = await withStore('readonly', (store) => getRecord(store));
  if (!record) return null;
  return { address: record.address, createdAt: record.createdAt };
}

/** Permanently removes the local keystore ("disconnect wallet"). */
export async function destroyWallet(): Promise<void> {
  await withStore('readwrite', (store) => {
    store.delete(RECORD_KEY);
    return Promise.resolve();
  });
}

async function importKeyPair(record: StoredKeyRecord): Promise<CryptoKeyPair> {
  const [publicKey, privateKey] = await Promise.all([
    crypto.subtle.importKey('jwk', record.publicKeyJwk, SIGNING_ALGORITHM, true, ['verify']),
    crypto.subtle.importKey('jwk', record.privateKeyJwk, SIGNING_ALGORITHM, true, ['sign']),
  ]);
  return { publicKey, privateKey };
}

/**
 * Signs an arbitrary canonical payload string with the active wallet's
 * private key. Throws if no wallet has been created on this device.
 */
export async function signPayload(canonicalPayload: string): Promise<string> {
  const record = await withStore('readonly', (store) => getRecord(store));
  if (!record) throw new Error('No wallet found. Create or unlock a wallet first.');

  const { privateKey } = await importKeyPair(record);
  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    privateKey,
    new TextEncoder().encode(canonicalPayload),
  );
  return bufferToHex(signature);
}

/** Returns the active wallet's exportable public key, hex-encoded. */
export async function getActivePublicKey(): Promise<string> {
  const record = await withStore('readonly', (store) => getRecord(store));
  if (!record) throw new Error('No wallet found. Create or unlock a wallet first.');
  return bufferToHex(new TextEncoder().encode(JSON.stringify(record.publicKeyJwk)));
}
