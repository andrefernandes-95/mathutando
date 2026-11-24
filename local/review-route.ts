import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Plugin } from 'vite'
import { review, ReviewFailure, submission } from './reviewer.ts'

async function readSubmission(req: IncomingMessage) {
  const chunks: Buffer[] = []
  let size = 0
  for await (const chunk of req) {
    size += chunk.length
    if (size > 16 * 1024 * 1024)
      throw new ReviewFailure(413, 'O desenho excede o tamanho de um pedido.')
    chunks.push(chunk)
  }
  try {
    return submission.parse(JSON.parse(Buffer.concat(chunks).toString('utf8')))
  } catch {
    throw new ReviewFailure(400, 'O enunciado ou os recortes são inválidos.')
  }
}
export function localReviews(key: string | undefined): Plugin {
  async function handle(
    req: IncomingMessage,
    res: ServerResponse,
    next: () => void,
  ) {
    if (req.url !== '/api/review') return next()
    res.setHeader('content-type', 'application/json')
    res.setHeader('cache-control', 'no-store')
    try {
      const host = req.headers.host ?? ''
      if (
        req.method !== 'POST' ||
        !/^127\.0\.0\.1:\d+$|^localhost:\d+$/.test(host) ||
        req.headers.origin !== 'http://' + host ||
        req.headers['x-mathutando'] !== 'review'
      )
        throw new ReviewFailure(403, 'Pedido local inválido.')
      if (!key)
        throw new ReviewFailure(
          503,
          'A revisão não está configurada neste computador.',
        )
      res.end(JSON.stringify(await review(await readSubmission(req), key)))
    } catch (e) {
      res.statusCode = e instanceof ReviewFailure ? e.status : 502
      res.end(
        JSON.stringify({
          message:
            e instanceof ReviewFailure
              ? e.message
              : 'Não foi possível contactar a OpenAI.',
        }),
      )
    }
  }
  return {
    name: 'mathutando-local-reviews',
    configureServer(s) {
      s.middlewares.use(handle)
    },
    configurePreviewServer(s) {
      s.middlewares.use(handle)
    },
  }
}
