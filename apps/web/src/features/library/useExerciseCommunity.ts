import { useEffect, useState } from 'react';
import { addComment, getComments, getDifficulty, setDifficulty } from './api';
import type { DifficultyStats, ExerciseComment } from './types';

type DiscussionState =
  | { status: 'loading' }
  | { status: 'ready'; comments: ExerciseComment[]; ratings: DifficultyStats }
  | { status: 'error' };

export function useExerciseCommunity(exerciseId: string, userId?: string) {
  const [discussion, setDiscussion] = useState<DiscussionState>({ status: 'loading' });
  const [revision, setRevision] = useState(0);
  const [posting, setPosting] = useState(false);
  const [rating, setRating] = useState(false);
  const [commentError, setCommentError] = useState('');
  const [ratingError, setRatingError] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([getComments(exerciseId), getDifficulty(exerciseId, userId)])
      .then(([comments, ratings]) => {
        if (active) setDiscussion({ status: 'ready', comments, ratings });
      })
      .catch(() => {
        if (active) setDiscussion({ status: 'error' });
      });
    return () => { active = false; };
  }, [exerciseId, userId, revision]);

  const refresh = () => setRevision(value => value + 1);

  function retry() {
    setDiscussion({ status: 'loading' });
    refresh();
  }

  async function publishComment(body: string): Promise<boolean> {
    if (!userId || posting || !body.trim()) return false;
    setPosting(true);
    setCommentError('');
    try {
      await addComment(exerciseId, userId, body);
      refresh();
      return true;
    } catch {
      setCommentError('Não foi possível publicar o comentário. Tenta novamente.');
      return false;
    } finally {
      setPosting(false);
    }
  }

  async function rateDifficulty(value: number): Promise<void> {
    if (!userId || rating) return;
    setRating(true);
    setRatingError('');
    try {
      await setDifficulty(exerciseId, userId, value);
      refresh();
    } catch {
      setRatingError('Não foi possível registar a dificuldade. Tenta novamente.');
    } finally {
      setRating(false);
    }
  }

  return { discussion, retry, posting, rating, commentError, ratingError, publishComment, rateDifficulty };
}
