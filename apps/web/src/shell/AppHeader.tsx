import { ArrowRight, LogOut } from 'lucide-react';

export type Screen = 'library' | 'community';

type AppHeaderProps = {
  screen: Screen;
  onNavigate: (screen: Screen) => void;
  userId: string | null;
  signingOut: boolean;
  onSignIn?: () => void;
  onSignOut: () => void;
};

export function AppHeader({ screen, onNavigate, userId, signingOut, onSignIn, onSignOut }: AppHeaderProps) {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <button className="wordmark" type="button" onClick={() => onNavigate('library')} aria-label="Mathutando, início">
          mathutando<span aria-hidden="true">.</span>
        </button>

        <nav className="site-nav" aria-label="Navegação principal">
          <button type="button" aria-current={screen === 'library' ? 'page' : undefined} onClick={() => onNavigate('library')}>
            Biblioteca
          </button>
          <button type="button" aria-current={screen === 'community' ? 'page' : undefined} onClick={() => onNavigate('community')}>
            Comunidade
          </button>
        </nav>

        {userId ? (
          <button className="account-button" type="button" onClick={onSignOut} disabled={signingOut}>
            {signingOut ? 'A sair…' : 'Sair'} <LogOut size={16} aria-hidden="true" />
          </button>
        ) : onSignIn && (
          <button className="account-button" type="button" onClick={onSignIn}>
            Entrar <ArrowRight size={17} aria-hidden="true" />
          </button>
        )}
      </div>
    </header>
  );
}
