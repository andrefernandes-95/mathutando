import { useEffect, useState } from 'react';
import type { ExerciseSummary } from '../library/types';
import { listFeed, type FeedPost } from './api';

type FeedState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; posts: FeedPost[] };

export function useFeed(exercises: ExerciseSummary[], enabled: boolean) {
  const [feed, setFeed] = useState<FeedState>({ status: 'loading' });
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    listFeed(exercises)
      .then(posts => {
        if (active) setFeed({ status: 'ready', posts });
      })
      .catch(() => {
        if (active) setFeed({ status: 'error' });
      });
    return () => { active = false; };
  }, [exercises, enabled, revision]);

  function refresh() {
    setFeed({ status: 'loading' });
    setRevision(value => value + 1);
  }

  return { feed, refresh };
}
