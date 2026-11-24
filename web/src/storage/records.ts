import type { Exercise, Review } from '../../../shared/exercise'

export type RecordOfWork = Exercise & {
  updated: number
  named: boolean
  versions: Review[]
}
const prefix = 'mathutando.work.v1:'

export function findWork(id: string): RecordOfWork | null {
  const raw = localStorage.getItem(prefix + id)
  return raw === null ? null : JSON.parse(raw)
}

export function allWork(): RecordOfWork[] {
  return Object.keys(localStorage)
    .filter((key) => key.startsWith(prefix))
    .map((key) => findWork(key.slice(prefix.length))!)
}

export function storeWork(work: RecordOfWork) {
  try {
    localStorage.setItem(prefix + work.id, JSON.stringify(work))
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError')
      throw Error(
        'O armazenamento local está cheio. Não foi possível guardar esta alteração.',
      )
    throw error
  }
}

export function writeWork<T>(action: () => T) {
  return navigator.locks.request('mathutando-storage-write', action)
}
