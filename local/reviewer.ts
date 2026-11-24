import { z } from 'zod'
import { statement } from '../shared/exercise.ts'
import { instruction, schema } from './prompt.ts'
import { retryUnavailable } from '../web/src/reviews/retry.ts'

export const submission = z.object({
  statement,
  tiles: z
    .array(z.object({ id: z.string().max(40), png: z.base64().min(4) }))
    .min(1)
    .max(20),
})
export class ReviewFailure extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}
export async function review(
  input: z.infer<typeof submission>,
  key: string,
  send = fetch,
) {
  const original = input.statement
  const picture = (mime: string, base64: string) => ({
    type: 'input_image',
    image_url: 'data:' + mime + ';base64,' + base64,
    detail: 'high',
  })
  const parts: object[] = [{ type: 'input_text', text: 'Enunciado original' }]
  parts.push(
    original.kind === 'text'
      ? { type: 'input_text', text: original.text }
      : picture(original.mime, original.data),
  )
  for (const tile of input.tiles)
    parts.push(
      { type: 'input_text', text: 'Recorte da resolução: ' + tile.id },
      picture('image/png', tile.png),
    )
  const response = await retryUnavailable(() =>
    send('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        authorization: 'Bearer ' + key,
        'content-type': 'application/json',
      },
      signal: AbortSignal.timeout(90000),
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        store: false,
        instructions: instruction,
        input: [{ role: 'user', content: parts }],
        max_output_tokens: 850,
        text: {
          format: {
            type: 'json_schema',
            name: 'math_review',
            strict: true,
            schema,
          },
        },
      }),
    }),
  )
  if (!response.ok) {
    const error = await response.json().catch(() => null)
    if (error?.error?.code === 'insufficient_quota')
      throw new ReviewFailure(
        429,
        'O projeto OpenAI não tem saldo disponível para esta revisão.',
      )
    if (response.status === 429)
      throw new ReviewFailure(
        429,
        'A OpenAI atingiu o limite de pedidos. Tenta novamente mais tarde.',
      )
    throw new ReviewFailure(
      502,
      'A OpenAI recusou a revisão (HTTP ' + response.status + ').',
    )
  }
  const data = await response.json()
  const text = data.output
    ?.flatMap(
      (item: { type: string; content?: { type: string; text?: string }[] }) =>
        item.type === 'message' ? (item.content ?? []) : [],
    )
    .filter((part: { type: string }) => part.type === 'output_text')
    .map((part: { text: string }) => part.text)
    .join('')
  if (data.status !== 'completed' || !text)
    throw new ReviewFailure(502, 'A OpenAI não concluiu a revisão.')
  return { text }
}
