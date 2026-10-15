import { createHash, pbkdf2, randomBytes, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const ITERATIONS = 310_000;
const KEY_LENGTH = 64;

// The async version runs on libuv's thread pool, so a burst of logins no longer
// freezes every other request the way pbkdf2Sync did.
const pbkdf2Async = promisify(pbkdf2);

// Well-formed but matches no password. Checking against it when an email is unknown
// keeps response times the same, so timing doesn't reveal which emails have accounts.
export const placeholderPasswordHash = `${'0'.repeat(32)}:${'0'.repeat(KEY_LENGTH * 2)}`;

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const hash = await pbkdf2Async(password, salt, ITERATIONS, KEY_LENGTH, 'sha512');
  return `${salt}:${hash.toString('hex')}`;
}

export async function verifyPassword(password: string, storedHash: string) {
  const [salt, expectedHex] = storedHash.split(':');
  if (!salt || !expectedHex || !/^[a-f0-9]+$/i.test(expectedHex)) return false;

  const expected = Buffer.from(expectedHex, 'hex');
  // A short or empty digest would compare equal to an equally short derived key.
  if (expected.length !== KEY_LENGTH) return false;

  const actual = await pbkdf2Async(password, salt, ITERATIONS, KEY_LENGTH, 'sha512');
  return timingSafeEqual(expected, actual);
}

export function createResetToken() {
  return randomBytes(32).toString('hex');
}

export function hashResetToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}
