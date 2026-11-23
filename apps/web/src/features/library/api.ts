import { getJson } from '../../shared/http';
import type { Topic, ExerciseSummary, ExerciseDetail } from './types';

export function listTopics(signal?: AbortSignal) {
  return getJson<Topic[]>('/api/v1/topics', signal);
}

export function listExercises(filters: { topicId?: string; year?: number }, signal?: AbortSignal) {
  const params = new URLSearchParams();
  if (filters.topicId) params.set('topicId', filters.topicId);
  if (filters.year) params.set('year', String(filters.year));
  const query = params.toString();
  return getJson<ExerciseSummary[]>(`/api/v1/exercises${query ? `?${query}` : ''}`, signal);
}

export function getExercise(id: string, signal?: AbortSignal) {
  return getJson<ExerciseDetail>(`/api/v1/exercises/${encodeURIComponent(id)}`, signal);
}
