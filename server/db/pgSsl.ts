import { existsSync, readFileSync } from 'fs';

// SSL settings for Postgres connections that come from a URL without sslmode.
//
// Supabase (and its pooler) refuses unencrypted connections. Connection strings copied from the
// Supabase dashboard have no sslmode, so turn SSL on for Supabase hosts unless the URL already
// says what to do. Supabase's certificate is not from a public CA, so it is not verified
// (same as sslmode=no-verify): the link is still encrypted.
//
// Amazon RDS (PostgreSQL 15 and later) also refuses unencrypted connections. Its certificates come
// from the Amazon RDS CA, which Node does not trust by default, so the RDS CA bundle is loaded and
// the server certificate is fully verified. The production image ships the bundle at
// /app/certs/rds-global-bundle.pem; RDS_CA_BUNDLE points somewhere else. Without the bundle the
// link is still encrypted but not verified, and a warning is logged once.

export const DEFAULT_RDS_CA_BUNDLE = '/app/certs/rds-global-bundle.pem';

type SslOption = { ssl?: { rejectUnauthorized: boolean; ca?: string } };

let warnedNoBundle = false;

export function isRdsHost(hostname: string): boolean {
  return /\.rds\.amazonaws\.com(\.cn)?$/i.test(hostname);
}

export function pgSslFor(
  connectionString: string,
  opts: { caBundlePath?: string; readFile?: (p: string) => string | null } = {}
): SslOption {
  try {
    const u = new URL(connectionString);
    if (u.searchParams.has('sslmode') || u.searchParams.has('ssl')) return {};
    if (/(^|\.)supabase\.(co|com)$/i.test(u.hostname)) return { ssl: { rejectUnauthorized: false } };
    if (isRdsHost(u.hostname)) {
      const path = opts.caBundlePath ?? process.env.RDS_CA_BUNDLE ?? DEFAULT_RDS_CA_BUNDLE;
      const read = opts.readFile ?? ((p: string) => (existsSync(p) ? readFileSync(p, 'utf8') : null));
      const ca = read(path);
      if (ca) return { ssl: { rejectUnauthorized: true, ca } };
      if (!warnedNoBundle) {
        warnedNoBundle = true;
        console.warn(`[db] RDS CA bundle not found at ${path}; the connection is encrypted but the server certificate is not verified.`);
      }
      return { ssl: { rejectUnauthorized: false } };
    }
  } catch {
    /* not a URL: leave it to pg */
  }
  return {};
}
