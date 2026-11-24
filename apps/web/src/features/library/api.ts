import { parseExerciseDefinition } from '@mathutando/contracts';
import { fetchProfileNames } from '../../shared/profileNames';
import { isConfigured, requireClient } from '../../shared/supabase';
import { demoDetail, demoExercise, demoTopics } from './demo';
import type { Catalog, DifficultyStats, ExerciseComment, ExerciseDetail, ExerciseSummary, Topic } from './types';

type TopicRow = {
  id: string;
  parent_id: string | null;
  slug: string;
  name: string;
  school_year: number | null;
  sort_order: number;
};

type ExerciseRow = {
  id: string;
  title: string;
  summary: string;
  topic_id: string;
  author_difficulty: number;
  current_version: number;
  published_at: string | null;
  author_id: string | null;
};

type CommentRow = {
  id: string;
  author_id: string;
  body: string;
  created_at: string;
};

function mapTopic(row: TopicRow): Topic {
  return {
    id: row.id,
    parentId: row.parent_id,
    slug: row.slug,
    name: row.name,
    schoolYear: row.school_year,
    sortOrder: row.sort_order,
  };
}

function mapExercise(row: ExerciseRow): ExerciseSummary {
  return {
    id: row.id,
    title: row.title,
    summary: row.summary,
    topicId: row.topic_id,
    authorDifficulty: row.author_difficulty,
    currentVersion: row.current_version,
    publishedAt: row.published_at,
    authorId: row.author_id,
  };
}

async function listTopics(): Promise<Topic[]> {
  const { data, error } = await requireClient()
    .from('topics')
    .select('id,parent_id,slug,name,school_year,sort_order')
    .order('sort_order')
    .limit(300);
  if (error) throw error;
  return (data as TopicRow[]).map(mapTopic);
}

async function listExercises(): Promise<ExerciseSummary[]> {
  const { data, error } = await requireClient()
    .from('exercises')
    .select('id,title,summary,topic_id,author_difficulty,current_version,published_at,author_id')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(200);
  if (error) throw error;
  return (data as ExerciseRow[]).map(mapExercise);
}

export async function loadCatalog(): Promise<Catalog> {
  if (!isConfigured) return { topics: demoTopics, exercises: [demoExercise] };
  const [topics, exercises] = await Promise.all([listTopics(), listExercises()]);
  return { topics, exercises };
}

export async function getExercise(exercise: ExerciseSummary): Promise<ExerciseDetail> {
  if (!isConfigured) return demoDetail;
  const { data, error } = await requireClient()
    .from('exercise_versions')
    .select('definition')
    .eq('exercise_id', exercise.id)
    .eq('version_number', exercise.currentVersion)
    .single();
  if (error) throw error;
  return { exercise, definition: parseExerciseDefinition(data.definition) };
}

export async function getComments(exerciseId: string): Promise<ExerciseComment[]> {
  const { data, error } = await requireClient()
    .from('exercise_comments')
    .select('id,author_id,body,created_at')
    .eq('exercise_id', exerciseId)
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) throw error;

  const rows = data as CommentRow[];
  const names = await fetchProfileNames(rows.map(row => row.author_id));
  return rows.map(row => ({
    id: row.id,
    authorId: row.author_id,
    authorName: names.get(row.author_id) ?? 'Utilizador',
    body: row.body,
    createdAt: row.created_at,
  }));
}

export async function addComment(exerciseId: string, userId: string, body: string): Promise<void> {
  const { error } = await requireClient()
    .from('exercise_comments')
    .insert({ exercise_id: exerciseId, author_id: userId, body: body.trim() });
  if (error) throw error;
}

export async function getDifficulty(exerciseId: string, userId?: string): Promise<DifficultyStats> {
  const { data, error } = await requireClient()
    .from('difficulty_ratings')
    .select('difficulty,user_id')
    .eq('exercise_id', exerciseId)
    .limit(5000);
  if (error) throw error;
  const rows = data as { difficulty: number; user_id: string }[];
  const count = rows.length;
  return {
    count,
    average: count ? rows.reduce((sum, row) => sum + row.difficulty, 0) / count : null,
    myRating: rows.find(row => row.user_id === userId)?.difficulty ?? null,
  };
}

export async function setDifficulty(exerciseId: string, userId: string, difficulty: number): Promise<void> {
  const { error } = await requireClient()
    .from('difficulty_ratings')
    .upsert({ exercise_id: exerciseId, user_id: userId, difficulty }, { onConflict: 'exercise_id,user_id' });
  if (error) throw error;
}
