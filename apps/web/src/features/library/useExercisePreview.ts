import { useEffect, useState } from 'react';
import { getExercise } from './api';
import type { ExerciseDetail, ExerciseSummary } from './types';

type PreviewState =
  | { status: 'loading' }
  | { status: 'ready'; detail: ExerciseDetail }
  | { status: 'error' };

export function useExercisePreview(exercise: ExerciseSummary) {
  const [preview, setPreview] = useState<PreviewState>({ status: 'loading' });
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    let active = true;
    getExercise(exercise)
      .then(detail => {
        if (active) setPreview({ status: 'ready', detail });
      })
      .catch(() => {
        if (active) setPreview({ status: 'error' });
      });
    return () => { active = false; };
  }, [exercise, revision]);

  function retry() {
    setPreview({ status: 'loading' });
    setRevision(value => value + 1);
  }

  return { preview, retry };
}
