import { useState, type FormEvent } from 'react';
import type { ExerciseSummary } from '../library/types';
import { publishPost } from './api';

type FeedComposerProps = {
  exercises: ExerciseSummary[];
  userId: string;
  onPublish: () => void;
};

export function FeedComposer({ exercises, userId, onPublish }: FeedComposerProps) {
  const [exerciseId, setExerciseId] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!exerciseId || !body.trim() || sending) return;
    setSending(true);
    setError('');
    try {
      await publishPost(userId, exerciseId, body);
      setExerciseId('');
      setBody('');
      onPublish();
    } catch {
      setError('Não foi possível publicar. Tenta novamente.');
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="feed-composer" aria-labelledby="composer-title">
      <h2 id="composer-title">Partilhar exercício</h2>
      <form onSubmit={event => void submit(event)}>
        <label htmlFor="post-exercise">Exercício da biblioteca</label>
        <select id="post-exercise" disabled={sending} value={exerciseId} onChange={event => setExerciseId(event.target.value)} required>
          <option value="">Seleciona um exercício</option>
          {exercises.map(exercise => <option key={exercise.id} value={exercise.id}>{exercise.title}</option>)}
        </select>
        <label htmlFor="post-text">A tua dúvida, explicação ou desafio</label>
        <textarea id="post-text" value={body} maxLength={500} rows={3} disabled={sending} required onChange={event => setBody(event.target.value)} />
        <div className="form-actions">
          <button className="primary" type="submit" disabled={sending || !exerciseId || !body.trim()}>
            {sending ? 'A publicar…' : 'Publicar'}
          </button>
          <small>{body.length}/500</small>
        </div>
      </form>
      {error && <p className="inline-error" role="alert">{error}</p>}
    </section>
  );
}
