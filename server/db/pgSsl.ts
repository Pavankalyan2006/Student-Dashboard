// Supabase (and its pooler) refuses unencrypted connections. Connection strings copied from the
// Supabase dashboard have no sslmode, so turn SSL on for Supabase hosts unless the URL already
// says what to do. Supabase's certificate is not from a public CA, so it is not verified
// (same as sslmode=no-verify): the link is still encrypted.
export function pgSslFor(connectionString: string): { ssl?: { rejectUnauthorized: boolean } } {
  try {
    const u = new URL(connectionString);
    if (u.searchParams.has('sslmode') || u.searchParams.has('ssl')) return {};
    if (/(^|\.)supabase\.(co|com)$/i.test(u.hostname)) return { ssl: { rejectUnauthorized: false } };
  } catch {
    /* not a URL: leave it to pg */
  }
  return {};
}
