import type { ExerciseDetail, ExerciseSummary, Topic } from './types';

export const demoTopics: Topic[] = [
  { id: '10000000-0000-4000-8000-000000000001', slug: '12-matematica-a', name: 'Matemática A', parentId: null, schoolYear: 12, sortOrder: 0 },
  { id: '10000000-0000-4000-8000-000000000002', slug: '12-probabilidades', name: 'Probabilidades', parentId: '10000000-0000-4000-8000-000000000001', schoolYear: 12, sortOrder: 1 },
  { id: '10000000-0000-4000-8000-000000000003', slug: '12-prob-condicionada', name: 'Probabilidade condicionada', parentId: '10000000-0000-4000-8000-000000000002', schoolYear: 12, sortOrder: 2 },
  { id: '10000000-0000-4000-8000-000000000004', slug: '12-combinatoria', name: 'Combinatória', parentId: '10000000-0000-4000-8000-000000000001', schoolYear: 12, sortOrder: 3 },
  { id: '10000000-0000-4000-8000-000000000005', slug: '11-geometria', name: 'Geometria', parentId: null, schoolYear: 11, sortOrder: 0 },
];
export const demoExercise: ExerciseSummary = {
  id: '20000000-0000-4000-8000-000000000001', title: 'O grupo de referência',
  summary: 'Descobre como interpretar «sabendo que» numa probabilidade condicionada.',
  topicId: demoTopics[2].id, authorDifficulty: 2, currentVersion: 1, authorId: null, publishedAt: null,
};
export const demoDetail: ExerciseDetail = {
  exercise: demoExercise,
  definition: { schemaVersion: 1, content: [{ type: 'paragraph', text: 'Numa turma existem 30 alunos: 18 raparigas e 12 rapazes. Praticam desporto 10 raparigas e 4 rapazes.' }],
    steps: [
      { id: 'grupo', title: 'Grupo de referência', interaction: { type: 'single-choice', prompt: 'Sabendo que um aluno pratica desporto, qual é o grupo de referência?', options: [
        { id: 'all', label: 'Os 30 alunos' }, { id: 'girls', label: 'As 18 raparigas' }, { id: 'athletes', label: 'Os 14 praticantes' }, { id: 'boys', label: 'Os 12 rapazes' },
      ] } },
      { id: 'casos', title: 'Casos favoráveis', interaction: { type: 'numeric-answer', prompt: 'Entre os praticantes, quantas são raparigas?', placeholder: 'Escreve um número' } },
    ],
  },
};
