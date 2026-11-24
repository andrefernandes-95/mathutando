import type { ExerciseDefinition } from '@mathutando/contracts';

export type Topic = { id: string; parentId: string | null; slug: string; name: string; schoolYear: number | null; sortOrder: number };
export type ExerciseSummary = {
  id: string; title: string; summary: string; topicId: string; authorDifficulty: number;
  currentVersion: number; publishedAt: string | null; authorId: string | null;
};
export type ExerciseDetail = { exercise: ExerciseSummary; definition: ExerciseDefinition };
export type ExerciseComment = { id: string; authorId: string; authorName: string; body: string; createdAt: string };
export type DifficultyStats = { count: number; average: number | null; myRating: number | null };

export type Catalog = {
  topics: Topic[];
  exercises: ExerciseSummary[];
};
