import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowRight, X } from 'lucide-react';
import { requestSignInLink } from './api';

export function AuthDialog({ onClose }: { onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const confirmationRef = useRef<HTMLHeadingElement>(null);
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sentTo, setSentTo] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    inputRef.current?.focus();
    return () => dialog?.close();
  }, []);

  useEffect(() => {
    if (sentTo) confirmationRef.current?.focus();
  }, [sentTo]);

  function dismiss() {
    dialogRef.current?.close();
    onClose();
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const address = email.trim();
    if (!address) return;

    setSending(true);
    setError('');
    try {
      await requestSignInLink(address, window.location.origin);
      setSentTo(address);
    } catch {
      setError('Não foi possível enviar o link. Confirma o email e tenta novamente.');
    } finally {
      setSending(false);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="auth-dialog"
      aria-labelledby="login-title"
      onCancel={event => {
        event.preventDefault();
        dismiss();
      }}
      onClick={event => {
        if (event.target === event.currentTarget) dismiss();
      }}
    >
      <div className="auth-content">
        <button className="icon-button auth-close" type="button" onClick={dismiss} aria-label="Fechar">
          <X size={21} aria-hidden="true" />
        </button>
        {sentTo ? (
          <>
            <h2 id="login-title" ref={confirmationRef} tabIndex={-1}>Consulta o teu email</h2>
            <p>Enviámos um link de acesso para <strong>{sentTo}</strong>. Abre-o neste dispositivo.</p>
          </>
        ) : (
          <>
            <h2 id="login-title">Entrar</h2>
            <p>Recebe um link de acesso por email, sem palavra-passe.</p>
            <form onSubmit={event => void submit(event)}>
              <label htmlFor="login-email">Email</label>
              <input
                id="login-email"
                ref={inputRef}
                type="email"
                autoComplete="email"
                required
                maxLength={254}
                value={email}
                onChange={event => setEmail(event.target.value)}
                placeholder="nome@exemplo.pt"
              />
              <button className="primary" type="submit" disabled={sending}>
                {sending ? 'A enviar…' : 'Enviar link de acesso'}
                <ArrowRight size={17} aria-hidden="true" />
              </button>
            </form>
            {error && <p className="inline-error" role="alert">{error}</p>}
          </>
        )}
      </div>
    </dialog>
  );
}
