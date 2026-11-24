import { useState, type FormEvent } from 'react';
import { useExerciseCommunity } from './useExerciseCommunity';

const difficultyLevels = [1, 2, 3, 4, 5];
const dateFormat = new Intl.DateTimeFormat('pt-PT', { day: 'numeric', month: 'short' });
const numberFormat = new Intl.NumberFormat('pt-PT', { maximumFractionDigits: 1 });

type ExerciseCommunityProps = {
  exerciseId: string;
  userId?: string;
  onAuthRequested: () => void;
};

export function ExerciseCommunity({ exerciseId, userId, onAuthRequested }: ExerciseCommunityProps) {
  const { discussion, retry, posting, rating, commentError, ratingError, publishComment, rateDifficulty } = useExerciseCommunity(exerciseId, userId);
  const [message, setMessage] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (await publishComment(message)) setMessage('');
  }

  if (discussion.status === 'loading') {
    return <p className="section-state" role="status">A carregar comentários e avaliações…</p>;
  }

  if (discussion.status === 'error') {
    return (
      <div className="section-state" role="alert">
        <p>Não foi possível carregar os comentários e as avaliações.</p>
        <button className="text-button" type="button" onClick={retry}>Tentar novamente</button>
      </div>
    );
  }

  const { comments, ratings } = discussion;

  return (
    <div className="exercise-discussion">
      <section className="difficulty-section" aria-labelledby="difficulty-title">
        <div className="discussion-heading">
          <h2 id="difficulty-title">Dificuldade sentida</h2>
          <p>
            {ratings.average === null
              ? 'Sem avaliações'
              : `${numberFormat.format(ratings.average)}/5 · ${ratings.count} ${ratings.count === 1 ? 'avaliação' : 'avaliações'}`}
          </p>
        </div>
        {userId ? (
          <div className="rating-row" role="group" aria-label="Avaliar dificuldade de 1 a 5">
            {difficultyLevels.map(level => (
              <button
                key={level}
                type="button"
                className="rating-button"
                disabled={rating}
                aria-label={`Dificuldade ${level} de 5`}
                aria-pressed={ratings.myRating === level}
                onClick={() => void rateDifficulty(level)}
              >
                {level}
              </button>
            ))}
          </div>
        ) : (
          <button className="text-button" type="button" onClick={onAuthRequested}>Entrar para avaliar</button>
        )}
        {ratingError && <p className="inline-error" role="alert">{ratingError}</p>}
      </section>
      <section aria-labelledby="comments-title">
        <h2 id="comments-title">Comentários</h2>
        {comments.length ? (
          <ul className="comment-list">
            {comments.map(comment => (
              <li className="comment" key={comment.id}>
                <div><strong>{comment.authorName}</strong> <time dateTime={comment.createdAt}>{dateFormat.format(new Date(comment.createdAt))}</time></div>
                <p>{comment.body}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">Ainda não há comentários.</p>
        )}
        {userId ? (
          <form onSubmit={event => void submit(event)} className="comment-form">
            <label htmlFor="comment-input">Partilha uma dúvida ou explicação</label>
            <textarea
              id="comment-input"
              maxLength={1000}
              rows={3}
              disabled={posting}
              value={message}
              onChange={event => setMessage(event.target.value)}
            />
            <button className="primary" type="submit" disabled={posting || !message.trim()}>
              {posting ? 'A publicar…' : 'Comentar'}
            </button>
          </form>
        ) : (
          <button className="text-button" type="button" onClick={onAuthRequested}>Entrar para comentar</button>
        )}
        {commentError && <p className="inline-error" role="alert">{commentError}</p>}
      </section>
    </div>
  );
}
