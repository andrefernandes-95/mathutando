import { requireClient, supabase } from '../../shared/supabase';

export function observeSession(onUserId: (userId: string | null) => void) {
  if (!supabase) return () => {};

  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    onUserId(session?.user.id ?? null);
  });

  return () => subscription.unsubscribe();
}

export async function requestSignInLink(email: string, redirectTo: string): Promise<void> {
  const { error } = await requireClient().auth.signInWithOtp({
    email,
    options: { emailRedirectTo: redirectTo },
  });
  if (error) throw error;
}

export async function endSession(): Promise<void> {
  const { error } = await requireClient().auth.signOut();
  if (error) throw error;
}
