import { describe, it, expect } from 'vitest';
import { Security } from '../../server/core/security';

describe('Authentication & Security Foundation', () => {
  it('hashes passwords securely using bcrypt', async () => {
    const plain = 'SecretPassword123!';
    const hash = await Security.hashPassword(plain);

    expect(hash).not.toBe(plain);
    expect(hash.startsWith('$2')).toBe(true);

    const match = await Security.comparePassword(plain, hash);
    expect(match).toBe(true);

    const failMatch = await Security.comparePassword('WrongPassword', hash);
    expect(failMatch).toBe(false);
  });

  it('generates and verifies JWT tokens with correct claims', () => {
    const payload = {
      userId: 'std_01j8k9x2p4',
      email: 'student@btech.edu',
      role: 'STUDENT' as const,
      name: 'Pavan Kalyan V.',
    };

    const token = Security.generateAccessToken(payload);
    expect(typeof token).toBe('string');

    const verified = Security.verifyAccessToken(token);
    expect(verified.userId).toBe(payload.userId);
    expect(verified.email).toBe(payload.email);
    expect(verified.role).toBe('STUDENT');
  });

  it('rejects invalid or tampered tokens', () => {
    expect(() => {
      Security.verifyAccessToken('invalid.jwt.token');
    }).toThrow();
  });
});
