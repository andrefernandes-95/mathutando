import { ArrowLeft } from 'lucide-react';
import { ExerciseCommunity } from './ExerciseCommunity';
import { ExercisePreview } from './ExercisePreview';
import type { ExerciseSummary, Topic } from './types';
import { useExercisePreview } from './useExercisePreview';

type ExerciseDetailsProps = {
  exercise: ExerciseSummary;
  topic?: Topic;
  userId?: string;
  communityAvailable: boolean;
  onClose: () => void;
  backLabel: string;
  onAuthRequested: () => void;
};

export function ExerciseDetails({ exercise, topic, userId, communityAvailable, onClose, backLabel, onAuthRequested }: ExerciseDetailsProps) {
  const { preview, retry } = useExercisePreview(exercise);
  const context = [topic?.schoolYear ? `${topic.schoolYear}.º ano` : null, topic?.name].filter(Boolean);

  return (
    <article className="exercise-reader">
      <button className="text-button reader-back" type="button" onClick={onClose}>
        <ArrowLeft size={17} aria-hidden="true" /> {backLabel}
      </button>
      <header className="exercise-header">
        {context.length > 0 && <p className="subject-label">{context.join(' · ')}</p>}
        <h1 tabIndex={-1}>{exercise.title}</h1>
        {exercise.summary && <p className="reader-summary">{exercise.summary}</p>}
      </header>

      {preview.status === 'ready' && <ExercisePreview definition={preview.detail.definition} />}
      {preview.status === 'loading' && <p className="section-state" role="status">A carregar exercício…</p>}
      {preview.status === 'error' && (
        <div className="section-state" role="alert">
          <p>Não foi possível carregar o exercício.</p>
          <button className="text-button" type="button" onClick={retry}>Tentar novamente</button>
        </div>
      )}

      {communityAvailable && preview.status === 'ready' && (
        <ExerciseCommunity key={userId ?? 'anonymous'} exerciseId={exercise.id} userId={userId} onAuthRequested={onAuthRequested} />
      )}
    </article>
  );
}
