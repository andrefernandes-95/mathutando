import { useEffect, useRef, useState } from 'react';
import { AuthDialog } from './features/auth/AuthDialog';
import { useAuth } from './features/auth/useAuth';
import { FeedView } from './features/feed/FeedView';
import { ExerciseDetails } from './features/library/ExerciseDetails';
import { LibraryView } from './features/library/LibraryView';
import { useCatalog } from './features/library/useCatalog';
import type { ExerciseSummary } from './features/library/types';
import { AppHeader, type Screen } from './shell/AppHeader';
import { isConfigured } from './shared/supabase';

export function App() {
  const { catalog, retry } = useCatalog();
  const { userId, signingOut, error: authError, signOut } = useAuth();
  const [screen, setScreen] = useState<Screen>('library');
  const [loginOpen, setLoginOpen] = useState(false);
  const [exercise, setExercise] = useState<ExerciseSummary | null>(null);
  const mainRef = useRef<HTMLElement>(null);
  const previousLocation = useRef('library');
  const exerciseOrigin = useRef<{ element: HTMLElement; scrollTop: number } | null>(null);
  const location = exercise ? `exercise:${exercise.id}` : screen;

  useEffect(() => {
    if (previousLocation.current === location) return;
    previousLocation.current = location;
    if (!exercise) {
      const origin = exerciseOrigin.current;
      exerciseOrigin.current = null;
      if (origin?.element.isConnected && !origin.element.closest('[hidden]')) {
        origin.element.focus({ preventScroll: true });
        window.scrollTo(0, origin.scrollTop);
        return;
      }
    }

    const heading = mainRef.current?.querySelector<HTMLElement>('[data-screen]:not([hidden]) h1');
    heading?.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }, [exercise, location]);

  function openExercise(next: ExerciseSummary, trigger: HTMLButtonElement) {
    exerciseOrigin.current = { element: trigger, scrollTop: window.scrollY };
    setExercise(next);
  }

  function navigate(next: Screen) {
    exerciseOrigin.current = null;
    setScreen(next);
    setExercise(null);
  }

  const requestSignIn = () => setLoginOpen(true);

  return (
    <>
      <a className="skip-link" href="#conteudo">Saltar para o conteúdo</a>
      <AppHeader
        screen={screen}
        onNavigate={navigate}
        userId={userId}
        signingOut={signingOut}
        onSignIn={isConfigured ? requestSignIn : undefined}
        onSignOut={() => void signOut()}
      />
      <main id="conteudo" ref={mainRef} className="main" tabIndex={-1}>
        {!isConfigured && <p className="demo-notice">Catálogo de demonstração. As contas e a comunidade estão indisponíveis.</p>}
        {authError && <p className="inline-error" role="alert">{authError}</p>}

        <div data-screen hidden={screen !== 'library' || Boolean(exercise)}>
          <LibraryView catalog={catalog} onRetry={retry} onOpen={openExercise} />
        </div>

        {screen === 'community' && !exercise && (
          <div data-screen>
            {catalog.status === 'ready' ? (
              <FeedView
                exercises={catalog.data.exercises}
                enabled={isConfigured}
                userId={userId ?? undefined}
                onOpen={openExercise}
                onAuthRequested={requestSignIn}
              />
            ) : (
              <section className="feed-page">
                <h1 tabIndex={-1}>Comunidade</h1>
                {catalog.status === 'loading' ? (
                  <p role="status">A carregar…</p>
                ) : (
                  <div role="alert">
                    <p>Não foi possível abrir a comunidade.</p>
                    <button className="text-button" type="button" onClick={retry}>Tentar novamente</button>
                  </div>
                )}
              </section>
            )}
          </div>
        )}

        {exercise && (
          <div data-screen>
            <ExerciseDetails
              key={exercise.id}
              exercise={exercise}
              topic={catalog.status === 'ready' ? catalog.data.topics.find(topic => topic.id === exercise.topicId) : undefined}
              userId={userId ?? undefined}
              communityAvailable={isConfigured}
              onClose={() => setExercise(null)}
              backLabel={screen === 'library' ? 'Biblioteca' : 'Comunidade'}
              onAuthRequested={requestSignIn}
            />
          </div>
        )}
      </main>
      {loginOpen && <AuthDialog onClose={() => setLoginOpen(false)} />}
    </>
  );
}
