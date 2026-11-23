export type Topic = {
  id: string;
  parentId: string | null;
  slug: string;
  name: string;
  schoolYear: number | null;
  sortOrder: number;
};

export type ExerciseSummary = {
  id: string;
  title: string;
  summary: string;
  topicId: string;
  authorDifficulty: number;
  currentVersion: number;
  publishedAt: string;
};

/** Apenas um contrato de visualização. O contrato do autor inclui as respostas. */
export type ExerciseDetail = { exercise: ExerciseSummary; definition: unknown };
