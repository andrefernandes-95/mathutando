import type { Statement, Stroke } from '../../../shared/exercise'
import { renderTiles } from './tiles'
import { decodeFeedback } from './feedback'

export async function reviewDrawing(statement: Statement, strokes: Stroke[]) {
  const tiles = renderTiles(strokes)
  const response = await fetch('/api/review', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-mathutando': 'review' },
    body: JSON.stringify({
      statement,
      tiles: tiles.map(({ id, png }) => ({ id, png })),
    }),
  })
  const result = await response.json().catch(() => null)
  if (!response.ok || typeof result?.text !== 'string')
    throw Error(
      result?.message ?? 'A ligação local à revisão está indisponível.',
    )
  return decodeFeedback(result.text, tiles)
}
