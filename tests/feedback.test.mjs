import test from 'node:test'
import assert from 'node:assert/strict'
import { decodeFeedback } from '../web/src/reviews/feedback.ts'
const tiles = [{ id: '1,-1', left: 752, top: -784 }]
test('a hint is attached to the worksheet coordinates and has no general answer field', () => {
  const input = {
    title: 'Contagem',
    explanation: 'ignored',
    notes: [
      {
        tile: '1,-1',
        x: 0.25,
        y: 0.5,
        text: 'Repara na independência destes acontecimentos.',
      },
      { tile: '9,9', x: 0, y: 0, text: 'outro' },
    ],
  }
  assert.deepEqual(decodeFeedback(JSON.stringify(input), tiles), {
    format: 'hints-v1',
    title: 'Contagem',
    notes: [{ text: input.notes[0].text, point: { x: 952, y: -384 } }],
  })
})
test('rejects feedback without a valid place on the drawing', () => {
  for (const p of [
    { x: 1.2, y: 0 },
    { x: 0 },
    { x: 0, y: 0, tile: 'absent' },
  ]) {
    assert.throws(
      () =>
        decodeFeedback(
          JSON.stringify({
            title: 'Título',
            notes: [{ tile: '1,-1', text: 'Pista', ...p }],
          }),
          tiles,
        ),
      /não localizou/,
    )
  }
})
