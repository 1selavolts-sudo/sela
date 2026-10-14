export type AdminSession = {
  email: string;
  role: string;
  expiresAt: number;
};

const sessionDurationMs = 8 * 60 * 60 * 1000;
const developmentSecret = 'local-only-admin-session-secret';

function encodeBase64Url(bytes: Uint8Array) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function decodeBase64Url(value: string) {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(base64 + '='.repeat((4 - (base64.length % 4)) % 4));
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function getSigningKey() {
  const secret = process.env.ADMIN_SESSION_SECRET || (process.env.NODE_ENV === 'production' ? '' : developmentSecret);
  if (!secret) throw new Error('ADMIN_SESSION_SECRET is not configured.');

  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

export async function createAdminSession(email: string, role: string) {
  const session: AdminSession = { email, role, expiresAt: Date.now() + sessionDurationMs };
  const payload = encodeBase64Url(new TextEncoder().encode(JSON.stringify(session)));
  const signature = await crypto.subtle.sign('HMAC', await getSigningKey(), new TextEncoder().encode(payload));
  return `${payload}.${encodeBase64Url(new Uint8Array(signature))}`;
}

export async function verifyAdminSession(value: string | undefined): Promise<AdminSession | null> {
  if (!value) return null;

  try {
    const [payload, signature, extra] = value.split('.');
    if (!payload || !signature || extra) return null;

    const valid = await crypto.subtle.verify(
      'HMAC',
      await getSigningKey(),
      decodeBase64Url(signature),
      new TextEncoder().encode(payload)
    );
    if (!valid) return null;

    const session = JSON.parse(new TextDecoder().decode(decodeBase64Url(payload))) as AdminSession;
    if (!session.email || !session.role || !Number.isFinite(session.expiresAt) || session.expiresAt <= Date.now()) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}
