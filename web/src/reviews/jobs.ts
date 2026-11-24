import type { Exercise, Review, Stroke } from '../../../shared/exercise'
import { library } from '../storage/library'
import { errorMessage } from '../api'
import { reviewDrawing } from './openai'

const channel =
  typeof BroadcastChannel === 'function'
    ? new BroadcastChannel('mathutando-reviews')
    : undefined
const changes = new EventTarget()
channel?.addEventListener('message', (event) =>
  changes.dispatchEvent(new Event(event.data)),
)
function notify(id: string) {
  changes.dispatchEvent(new Event(id))
  channel?.postMessage(id)
}
export function subscribe(id: string, listener: () => void) {
  changes.addEventListener(id, listener)
  return () => changes.removeEventListener(id, listener)
}
const lockName = (id: string) => 'mathutando-review:' + id
export async function recoverInterrupted(id: string) {
  await navigator.locks.request(
    lockName(id),
    { ifAvailable: true },
    async (lock) => {
      if (!lock) return
      for (const version of await library.history(id)) {
        if (version.state === 'pending') {
          await library.putReview(id, {
            ...version,
            state: 'failed',
            error: 'A revisão foi interrompida. Podes repetir o pedido.',
          })
          notify(id)
        }
      }
    },
  )
}
export async function requestReview(
  exercise: Exercise,
  strokes: Stroke[],
  previous?: Review,
) {
  await navigator.locks.request(
    lockName(exercise.id),
    { ifAvailable: true },
    async (lock) => {
      if (!lock) throw Error('Já há uma revisão em curso neste exercício.')
      const version: Review = {
        id: previous?.id ?? crypto.randomUUID(),
        created: previous?.created ?? Date.now(),
        strokes: previous?.strokes ?? strokes,
        state: 'pending',
      }
      await library.putReview(exercise.id, version)
      notify(exercise.id)
      try {
        const feedback = await reviewDrawing(
          exercise.statement,
          version.strokes,
        )
        await library.putReview(exercise.id, {
          ...version,
          state: 'done',
          feedback,
        })
      } catch (error) {
        await library.putReview(exercise.id, {
          ...version,
          state: 'failed',
          error: errorMessage(error),
        })
      } finally {
        notify(exercise.id)
      }
    },
  )
}
