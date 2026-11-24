import type { Review, Statement, Stroke } from '../../../shared/exercise'
import { allWork, findWork, storeWork, writeWork } from './records'
import { migrateOnce } from './legacy'

function getWork(id: string) {
  const work = findWork(id)
  if (!work) throw Error('Exercício não encontrado.')
  return work
}
export const library = {
  async list() {
    await migrateOnce()
    return allWork()
      .sort((a, b) => b.updated - a.updated)
      .map((e) => ({
        id: e.id,
        title: e.title,
        updated: e.updated,
        reviews: e.versions.length,
      }))
  },
  async get(id: string) {
    await migrateOnce()
    return getWork(id)
  },
  async create(statement: Statement) {
    await migrateOnce()
    return writeWork(() => {
      const id = crypto.randomUUID()
      storeWork({
        id,
        title:
          statement.kind === 'image' && statement.name
            ? statement.name
            : 'Exercício sem nome',
        statement,
        strokes: [],
        revision: 0,
        updated: Date.now(),
        named: false,
        versions: [],
      })
      return { id }
    })
  },
  async save(id: string, revision: number, strokes: Stroke[]) {
    await migrateOnce()
    return writeWork(() => {
      const work = getWork(id)
      if (work.revision !== revision)
        throw Error(
          'A folha foi alterada noutra janela. Volta a abrir o exercício.',
        )
      storeWork({
        ...work,
        revision: revision + 1,
        strokes,
        updated: Date.now(),
      })
      return { revision: revision + 1 }
    })
  },
  async history(id: string) {
    await migrateOnce()
    return getWork(id).versions.sort((a, b) => b.created - a.created)
  },
  async putReview(id: string, review: Review) {
    await migrateOnce()
    return writeWork(() => {
      const work = getWork(id)
      work.versions = work.versions
        .filter((r) => r.id !== review.id)
        .concat(review)
      if (review.feedback && !work.named) {
        work.title = review.feedback.title
        work.named = true
      }
      storeWork({ ...work, updated: Date.now() })
    })
  },
}
