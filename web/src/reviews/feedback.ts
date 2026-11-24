import { z } from 'zod'
import { tileSize, type Tile } from './tiles.ts'

const output = z.object({
  title: z.string().trim().min(1).max(160),
  notes: z.array(z.unknown()).max(4),
})
const note = z.object({
  text: z.string().trim().min(1).max(480),
  tile: z.string(),
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
})
export function decodeFeedback(
  text: string,
  tiles: Pick<Tile, 'id' | 'left' | 'top'>[],
) {
  const data = output.parse(JSON.parse(text))
  const notes = data.notes.flatMap((item) => {
    const parsed = note.safeParse(item)
    if (!parsed.success) return []
    const { tile, x, y, text } = parsed.data
    const image = tiles.find((t) => t.id === tile)
    return image
      ? [
          {
            text,
            point: {
              x: image.left + x * tileSize,
              y: image.top + y * tileSize,
            },
          },
        ]
      : []
  })
  if (!notes.length)
    throw Error(
      'A revisão não localizou a passagem na folha. Podes repetir a revisão.',
    )
  return { format: 'hints-v1' as const, title: data.title, notes }
}
