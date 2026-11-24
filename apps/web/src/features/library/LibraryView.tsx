import { useRef, useState } from 'react';
import { ArrowRight, RotateCcw } from 'lucide-react';
import { defaultFilters, filterExercises } from './filter';
import { LibraryFilters } from './LibraryFilters';
import { LibraryMasthead } from './LibraryMasthead';
import type { CatalogState } from './useCatalog';
import type { ExerciseSummary, Topic } from './types';

type LibraryViewProps = {
  catalog: CatalogState;
  onRetry: () => void;
  onOpen: (exercise: ExerciseSummary, trigger: HTMLButtonElement) => void;
};

type ExerciseRowProps = {
  exercise: ExerciseSummary;
  topic?: Topic;
  onOpen: (exercise: ExerciseSummary, trigger: HTMLButtonElement) => void;
};

function ExerciseRow({ exercise, topic, onOpen }: ExerciseRowProps) {
  const context = [topic?.schoolYear ? `${topic.schoolYear}.º ano` : null, topic?.name].filter(Boolean);

  return (
    <li className="catalog-row">
      <div className="catalog-row-copy">
        {context.length > 0 && <p className="catalog-context">{context.join(' · ')}</p>}
        <h3>
          <button type="button" className="exercise-link" onClick={event => onOpen(exercise, event.currentTarget)}>
            {exercise.title}
            <ArrowRight className="exercise-arrow" size={21} aria-hidden="true" />
          </button>
        </h3>
        {exercise.summary && <p className="catalog-summary">{exercise.summary}</p>}
      </div>
      <p className="catalog-difficulty">
        Dificuldade proposta <strong>{exercise.authorDifficulty}/5</strong>
      </p>
    </li>
  );
}

export function LibraryView({ catalog, onRetry, onOpen }: LibraryViewProps) {
  const [filters, setFilters] = useState(defaultFilters);
  const searchRef = useRef<HTMLInputElement>(null);
  const data = catalog.status === 'ready' ? catalog.data : null;
  const topics = data?.topics ?? [];
  const exercises = data ? filterExercises(data, filters) : [];
  const topicsById = new Map(topics.map(topic => [topic.id, topic]));
  const filtered = filters.year !== null || filters.topicId !== '' || filters.query.trim() !== '';

  function clearFilters() {
    setFilters(defaultFilters);
    searchRef.current?.focus();
  }

  return (
    <>
      <LibraryMasthead />
      <section className="catalog" aria-labelledby="catalog-heading" aria-busy={catalog.status === 'loading'}>
        <LibraryFilters topics={topics} filters={filters} onChange={setFilters} searchRef={searchRef} />
        <div className="catalog-heading">
          <h2 id="catalog-heading">Exercícios</h2>
          <p role="status">
            {catalog.status === 'ready' && (
              exercises.length === 1 ? '1 exercício' : `${exercises.length} exercícios`
            )}
          </p>
        </div>

        {catalog.status === 'loading' && <p className="section-state" role="status">A carregar exercícios…</p>}
        {catalog.status === 'error' && (
          <div className="section-state" role="alert">
            <h3>Não foi possível carregar a biblioteca.</h3>
            <button className="text-button" type="button" onClick={onRetry}>
              <RotateCcw size={16} aria-hidden="true" /> Tentar novamente
            </button>
          </div>
        )}
        {catalog.status === 'ready' && exercises.length === 0 && (
          <div className="section-state">
            <h3>{filtered ? 'Nenhum exercício corresponde aos filtros.' : 'Ainda não há exercícios publicados.'}</h3>
            {filtered && (
              <button className="text-button" type="button" onClick={clearFilters}>Limpar filtros</button>
            )}
          </div>
        )}
        {exercises.length > 0 && (
          <ul className="catalog-list">
            {exercises.map(exercise => (
              <ExerciseRow key={exercise.id} exercise={exercise} topic={topicsById.get(exercise.topicId)} onOpen={onOpen} />
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
