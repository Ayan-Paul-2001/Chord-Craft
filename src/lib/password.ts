import crypto from 'crypto';

const SCRYPT_PREFIX = 'scrypt$';
const KEY_LEN = 64;

/**
 * Constant-time string comparison resistant to timing side-channel attacks.
 */
export function safeCompareSecret(provided: string, expected: string): boolean {
  if (!provided || !expected) return false;
  const a = crypto.createHash('sha256').update(provided, 'utf8').digest();
  const b = crypto.createHash('sha256').update(expected, 'utf8').digest();
  return crypto.timingSafeEqual(a, b);
}

/**
 * Hashes a plaintext password using Node's native scrypt with a 16-byte random salt.
 */
export function hashPassword(plain: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(plain, salt, KEY_LEN).toString('hex');
  return `${SCRYPT_PREFIX}${salt}$${derived}`;
}

/**
 * Returns true if the stored password is already hashed with scrypt.
 */
export function isPasswordHashed(stored?: string | null): boolean {
  return Boolean(stored && stored.startsWith(SCRYPT_PREFIX));
}

/**
 * Verifies a plaintext password against either an scrypt hash or (for seamless
 * legacy migration) an older plaintext DB value using constant-time comparison.
 */
export function verifyPassword(plain: string, stored?: string | null): boolean {
  if (!plain || !stored) return false;

  if (stored.startsWith(SCRYPT_PREFIX)) {
    const parts = stored.split('$');
    if (parts.length !== 3) return false;
    const [, salt, storedHex] = parts;
    if (!salt || !storedHex) return false;
    try {
      const derivedBuf = crypto.scryptSync(plain, salt, KEY_LEN);
      const storedBuf = Buffer.from(storedHex, 'hex');
      if (derivedBuf.length !== storedBuf.length) return false;
      return crypto.timingSafeEqual(derivedBuf, storedBuf);
    } catch {
      return false;
    }
  }

  // Legacy plaintext fallback (upgraded to scrypt hash automatically on login)
  return safeCompareSecret(plain, stored);
}
