/**
 * The name shown in the app footer ("Designed for …").
 *
 * The source is the signed-in student's record from the backend (/auth/me or the Firebase session
 * bootstrap), kept in the auth store. That record's name is synced from the central profile's
 * identity.full_name on every profile save, and the auth store is refreshed after each save, so a
 * name change shows up without a reload. Nothing here reads localStorage or a hardcoded value.
 */
export interface StudentLike {
  id?: string | null;
  name?: string | null;
  full_name?: string | null;
}

/** Returns the registered name to display, or null when there is no signed-in student with a usable name. */
export function registeredStudentName(student: StudentLike | null | undefined, isAuthenticated: boolean): string | null {
  if (!isAuthenticated || !student || !student.id) return null;
  const raw = (student.name ?? student.full_name ?? '').toString();
  const name = raw.replace(/\s+/g, ' ').trim();
  if (name.length < 2) return null;
  return name.length > 80 ? `${name.slice(0, 79)}…` : name;
}

/** The footer line itself. Signed-out or nameless sessions get a neutral line, never someone else's name. */
export function footerSignature(student: StudentLike | null | undefined, isAuthenticated: boolean): string {
  const name = registeredStudentName(student, isAuthenticated);
  return name ? `Designed for ${name}` : 'Your personal learning workspace';
}

export function initialsFor(name: string | null | undefined): string {
  if (!name) return 'ST';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = parts.length === 1 ? parts[0].slice(0, 2) : parts[0][0] + parts[parts.length - 1][0];
  return letters.toUpperCase();
}
