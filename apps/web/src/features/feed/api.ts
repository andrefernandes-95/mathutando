import { fetchProfileNames } from '../../shared/profileNames';
import { requireClient } from '../../shared/supabase';
import type { ExerciseSummary } from '../library/types';

type PostRow = {
  id: string;
  author_id: string;
  exercise_id: string;
  body: string;
  created_at: string;
};

export type FeedPost = {
  id: string;
  authorName: string;
  body: string;
  createdAt: string;
  exercise: ExerciseSummary | null;
};

export async function listFeed(exercises: ExerciseSummary[]): Promise<FeedPost[]> {
  const { data, error } = await requireClient()
    .from('posts')
    .select('id,author_id,exercise_id,body,created_at')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) throw error;

  const rows = data as PostRow[];
  const names = await fetchProfileNames(rows.map(row => row.author_id));
  const exercisesById = new Map(exercises.map(exercise => [exercise.id, exercise]));
  return rows.map(row => ({
    id: row.id,
    authorName: names.get(row.author_id) ?? 'Utilizador',
    body: row.body,
    createdAt: row.created_at,
    exercise: exercisesById.get(row.exercise_id) ?? null,
  }));
}

export async function publishPost(userId: string, exerciseId: string, body: string): Promise<void> {
  const { error } = await requireClient()
    .from('posts')
    .insert({ author_id: userId, exercise_id: exerciseId, body: body.trim() });
  if (error) throw error;
}
