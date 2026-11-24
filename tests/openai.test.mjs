import test from 'node:test'
import assert from 'node:assert/strict'
import { review } from '../local/reviewer.ts'

const input = {
  statement: {
    kind: 'image',
    mime: 'image/png',
    name: 'diagrama',
    data: 'AAAA',
  },
  tiles: [{ id: '1,0', png: 'BBBB' }],
}
test('sends the statement and tagged sketch with the project key, returning only the review', async () => {
  const result = await review(input, 'test-key', async (url, options) => {
    assert.equal(url, 'https://api.openai.com/v1/responses')
    assert.equal(options.headers.authorization, 'Bearer test-key')
    const body = JSON.parse(options.body)
    assert.equal(body.store, false)
    assert.equal(
      body.input[0].content.filter((p) => p.type === 'input_image').length,
      2,
    )
    assert.ok(
      body.input[0].content.some((p) => p.text === 'Recorte da resolução: 1,0'),
    )
    assert.equal(body.text.format.strict, true)
    return Response.json({
      status: 'completed',
      output: [
        { type: 'message', content: [{ type: 'output_text', text: '{}' }] },
      ],
    })
  })
  assert.deepEqual(result, { text: '{}' })
})
test('explains a project without credit without returning the provider error body', async () => {
  await assert.rejects(
    review(input, 'test-key', async () =>
      Response.json({ error: { code: 'insufficient_quota' } }, { status: 429 }),
    ),
    /não tem saldo/,
  )
})
