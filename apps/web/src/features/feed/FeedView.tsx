import { ArrowRight } from 'lucide-react';
import type { ExerciseSummary } from '../library/types';
import { FeedComposer } from './FeedComposer';
import type { FeedPost } from './api';
import { useFeed } from './useFeed';

const dateFormat = new Intl.DateTimeFormat('pt-PT', { dateStyle: 'medium' });

type FeedViewProps = {
  exercises: ExerciseSummary[];
  enabled: boolean;
  userId?: string;
  onOpen: (exercise: ExerciseSummary, trigger: HTMLButtonElement) => void;
  onAuthRequested: () => void;
};

function Publication({ post, onOpen }: { post: FeedPost; onOpen: FeedViewProps['onOpen'] }) {
  const { exercise } = post;
  return (
    <article className="feed-post">
      <div className="feed-author">
        <strong>{post.authorName}</strong>
        <time dateTime={post.createdAt}>{dateFormat.format(new Date(post.createdAt))}</time>
      </div>
      <p>{post.body}</p>
      {exercise && (
        <aside className="shared-exercise" aria-label="Exercício partilhado">
          <button className="text-button" type="button" onClick={event => onOpen(exercise, event.currentTarget)}>
            {exercise.title}<ArrowRight size={16} aria-hidden="true" />
          </button>
          {exercise.summary && <p>{exercise.summary}</p>}
        </aside>
      )}
    </article>
  );
}

export function FeedView({ exercises, enabled, userId, onOpen, onAuthRequested }: FeedViewProps) {
  const { feed, refresh } = useFeed(exercises, enabled);

  return (
    <section className="feed-page">
      <header className="feed-header">
        <h1 tabIndex={-1}>Comunidade</h1>
        <p>Partilha um exercício para discutir em conjunto.</p>
      </header>
      {enabled ? (
        <>
          {userId ? (
            <FeedComposer key={userId} exercises={exercises} userId={userId} onPublish={refresh} />
          ) : (
            <button className="text-button" type="button" onClick={onAuthRequested}>Entrar para publicar</button>
          )}
          {feed.status === 'loading' && <p className="section-state" role="status">A carregar publicações…</p>}
          {feed.status === 'error' && (
            <div className="section-state" role="alert">
              <p>Não foi possível carregar as publicações.</p>
              <button className="text-button" type="button" onClick={refresh}>Tentar novamente</button>
            </div>
          )}
          {feed.status === 'ready' && (
            feed.posts.length === 0
              ? <p className="section-state">Ainda não há publicações.</p>
              : feed.posts.map(post => <Publication key={post.id} post={post} onOpen={onOpen} />)
          )}
        </>
      ) : (
        <p className="section-state">A comunidade está indisponível no catálogo de demonstração.</p>
      )}
    </section>
  );
}
