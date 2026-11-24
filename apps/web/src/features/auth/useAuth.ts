import { useEffect, useState } from 'react';
import { endSession, observeSession } from './api';

export function useAuth() {
  const [userId, setUserId] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => observeSession(setUserId), []);

  async function signOut() {
    setSigningOut(true);
    setError('');
    try {
      await endSession();
    } catch {
      setError('Não foi possível terminar a sessão. Tenta novamente.');
    } finally {
      setSigningOut(false);
    }
  }

  return { userId, signingOut, error, signOut };
}
