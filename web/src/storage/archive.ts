import { z } from 'zod'
import { statement, drawing, point } from '../../../shared/exercise'
import { findWork, storeWork, writeWork } from './records'

const base = z.object({ id: z.uuid() })
const archive = z.object({
  format: z.literal('mathutando-1'),
  exercises: z.array(
    base.extend({
      title: z.string(),
      statement,
      strokes: drawing,
      revision: z.int(),
      named: z.boolean(),
      updated: z.number(),
    }),
  ),
  reviews: z.array(
    base.extend({
      exercise: z.uuid(),
      created: z.number(),
      strokes: drawing,
      state: z.enum(['done', 'pending', 'failed']),
      error: z.string().nullish(),
      feedback: z
        .object({
          format: z.literal('hints-v1').optional(),
          title: z.string(),
          notes: z.array(
            z.object({ text: z.string(), point: point.optional() }),
          ),
        })
        .nullish(),
    }),
  ),
})
export async function importArchive(input: unknown) {
  const data = archive.parse(input)
  return writeWork(() => {
    const incoming = new Set(data.exercises.map((e) => e.id))
    if (
      data.reviews.some(
        (r) => !incoming.has(r.exercise) && !findWork(r.exercise),
      )
    )
      throw Error('Versão sem exercício.')
    for (const id of new Set([
      ...incoming,
      ...data.reviews.map((r) => r.exercise),
    ])) {
      const work = findWork(id) ?? {
        ...data.exercises.find((e) => e.id === id)!,
        versions: [],
      }
      const seen = new Set(work.versions.map((v) => v.id))
      for (const r of data.reviews.filter((r) => r.exercise === id)) {
        if (seen.has(r.id)) continue
        work.versions.push({
          id: r.id,
          created: r.created,
          strokes: r.strokes,
          state: r.state === 'pending' ? 'failed' : r.state,
          error:
            r.state === 'pending'
              ? 'A revisão foi interrompida.'
              : (r.error ?? undefined),
          feedback: r.feedback ?? undefined,
        })
        seen.add(r.id)
      }
      storeWork(work)
    }
  })
}
