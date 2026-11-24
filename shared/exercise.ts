import { z } from 'zod'

const coordinate = z.number().finite().min(-1_000_000).max(1_000_000)
export const point = z.object({ x: coordinate, y: coordinate })
export type Point = z.infer<typeof point>
export const stroke = z.object({
  id: z.uuid(),
  points: z.array(point).min(1).max(20000),
})
export const drawing = z.array(stroke).max(5000)
export type Stroke = z.infer<typeof stroke>

export const statement = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('text'),
    text: z.string().trim().min(1).max(20000),
  }),
  z.object({
    kind: z.literal('image'),
    name: z.string().max(240),
    mime: z.enum(['image/jpeg', 'image/png', 'image/webp']),
    data: z.base64().min(4).max(9_000_000),
  }),
])
export type Statement = z.infer<typeof statement>
export type ExerciseSummary = {
  id: string
  title: string
  updated: number
  reviews: number
}
export type Exercise = {
  id: string
  title: string
  statement: Statement
  strokes: Stroke[]
  revision: number
}
export type Feedback = {
  format?: 'hints-v1'
  title: string
  notes: { text: string; point?: Point }[]
}
export type Review = {
  id: string
  created: number
  state: 'pending' | 'done' | 'failed'
  error?: string
  feedback?: Feedback
  strokes: Stroke[]
}
export type ReviewSummary = Omit<Review, 'strokes' | 'feedback'>
