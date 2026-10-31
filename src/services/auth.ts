import { supabase } from '@/lib/supabase';
import { clearSessionContext } from '@/services/sessionContext';

const GENERIC_AUTH_ERROR = 'Something went wrong. Please check your connection and try again.';

export async function signInWithEmail(email: string, password: string): Promise<string | null> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (!error) return null;
  if (error.message === 'Invalid login credentials') return 'The email or password is incorrect.';
  return GENERIC_AUTH_ERROR;
}

export async function signUpWithEmail(
  email: string,
  password: string,
): Promise<{ error: string | null; requiresConfirmation: boolean }> {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) {
    if (error.message.toLowerCase().includes('already registered')) {
      return { error: 'An account with this email already exists. Try signing in instead.', requiresConfirmation: false };
    }
    return { error: GENERIC_AUTH_ERROR, requiresConfirmation: false };
  }
  return { error: null, requiresConfirmation: data.session === null };
}

export async function signOutUser(): Promise<void> {
  await supabase.auth.signOut();
  clearSessionContext();
}
