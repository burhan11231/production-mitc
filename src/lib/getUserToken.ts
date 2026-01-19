import { getAuth } from 'firebase/auth';

/**
 * Safely returns the current Firebase ID token.
 * Never rely on AppUser for auth tokens.
 */
export async function getUserToken(): Promise<string | null> {
  const user = getAuth().currentUser;
  if (!user) return null;
  return user.getIdToken();
}