import { z } from 'zod';

/** Public lesson content. Never include answer keys or hidden grading rules. */
const contentBlock = z.discriminatedUnion('type', [
  z.object({ type: z.literal('paragraph'), text: z.string().min(1).max(3000) }),
  z.object({ type: z.literal('formula'), latex: z.string().min(1).max(1000) }),
]);
const option = z.object({ id: z.string().min(1).max(64), label: z.string().min(1).max(500) });
export const interactionSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('single-choice'), prompt: z.string().min(1).max(1000), options: z.array(option).min(2).max(8) }).refine(x => new Set(x.options.map(o => o.id)).size === x.options.length, 'Os IDs das opções devem ser únicos'),
  z.object({ type: z.literal('numeric-answer'), prompt: z.string().min(1).max(1000), placeholder: z.string().max(100).optional() }),
]);
export const exerciseDefinitionSchema = z.object({
  schemaVersion: z.literal(1),
  content: z.array(contentBlock).max(25).default([]),
  steps: z.array(z.object({ id: z.string().min(1).max(64), title: z.string().min(1).max(200), interaction: interactionSchema })).min(1).max(30),
}).refine(x => new Set(x.steps.map(s => s.id)).size === x.steps.length, 'Os IDs das etapas devem ser únicos');

export type ExerciseDefinition = z.infer<typeof exerciseDefinitionSchema>;
export type Interaction = z.infer<typeof interactionSchema>;
export function parseExerciseDefinition(input: unknown): ExerciseDefinition {
  return exerciseDefinitionSchema.parse(input);
}
