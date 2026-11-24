import test from 'node:test'
import assert from 'node:assert/strict'
import { retryUnavailable } from '../web/src/reviews/retry.ts'

test('a rejected generation honours Retry-After before recovering', async () => {
  const responses = [
    new Response('', { status: 503, headers: { 'retry-after': '5' } }),
    new Response('ok'),
  ]
  const pauses = []
  const response = await retryUnavailable(
    async () => responses.shift(),
    async (ms) => {
      pauses.push(ms)
    },
  )
  assert.equal(await response.text(), 'ok')
  assert.deepEqual(pauses, [5000])
})

test('persistent overload stops after three attempts', async () => {
  let calls = 0
  const pauses = []
  const result = await retryUnavailable(
    async () => {
      calls++
      return new Response(null, { status: 503 })
    },
    async (ms) => {
      pauses.push(ms)
    },
  )
  assert.equal(calls, 3)
  assert.equal(result.status, 503)
  assert.deepEqual(pauses, [2000, 6000])
})

test('long provider cooldowns, quota errors and ambiguous failures are not retried', async () => {
  const neverWait = async () => assert.fail('unexpected retry')
  for (const status of [400, 401, 429, 503]) {
    const response = new Response(null, {
      status,
      headers: { 'retry-after': '120' },
    })
    assert.equal(
      await retryUnavailable(async () => response, neverWait),
      response,
    )
  }
  await assert.rejects(
    retryUnavailable(async () => {
      throw new Error('network')
    }, neverWait),
    /network/,
  )
})
