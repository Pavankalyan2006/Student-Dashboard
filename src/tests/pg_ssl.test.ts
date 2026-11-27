import { describe, it, expect } from 'vitest';
import { pgSslFor, isRdsHost } from '../../server/db/pgSsl';

const RDS_URL = 'postgresql://nexora:pw@nexora-db.abc123xyz.ap-south-1.rds.amazonaws.com:5432/nexora';

describe('Postgres SSL settings', () => {
  it('recognises Amazon RDS hosts only', () => {
    expect(isRdsHost('nexora-db.abc123xyz.ap-south-1.rds.amazonaws.com')).toBe(true);
    expect(isRdsHost('db.example.com')).toBe(false);
    expect(isRdsHost('rds.amazonaws.com.evil.example')).toBe(false);
  });

  it('verifies RDS certificates with the CA bundle when it is present', () => {
    const ssl = pgSslFor(RDS_URL, { caBundlePath: '/x/bundle.pem', readFile: (p) => (p === '/x/bundle.pem' ? 'CA-PEM' : null) });
    expect(ssl).toEqual({ ssl: { rejectUnauthorized: true, ca: 'CA-PEM' } });
  });

  it('still encrypts RDS connections when the bundle is missing', () => {
    expect(pgSslFor(RDS_URL, { caBundlePath: '/missing.pem', readFile: () => null })).toEqual({ ssl: { rejectUnauthorized: false } });
  });

  it('leaves an explicit sslmode in the URL to pg', () => {
    expect(pgSslFor(`${RDS_URL}?sslmode=verify-full`)).toEqual({});
  });

  it('keeps the Supabase and plain-Postgres behaviour', () => {
    expect(pgSslFor('postgresql://u:p@db.abcd.supabase.co:5432/postgres')).toEqual({ ssl: { rejectUnauthorized: false } });
    expect(pgSslFor('postgresql://u:p@localhost:5432/app')).toEqual({});
  });
});
