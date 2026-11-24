import { importArchive } from './archive'
const marker = 'mathutando.storage.v1.imported'
let pending: Promise<void> | undefined

function read<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}
async function migrate() {
  if (localStorage.getItem(marker)) return
  if (typeof indexedDB === 'undefined') return
  const name = 'mathutando-folhas'
  if (
    typeof indexedDB.databases === 'function' &&
    !(await indexedDB.databases()).some((db) => db.name === name)
  ) {
    localStorage.setItem(marker, '1')
    return
  }
  const req = indexedDB.open(name)
  let missing = false
  req.onupgradeneeded = () => {
    missing = true
    req.transaction!.abort()
  }
  const db = await read(req).catch((error) => {
    if (!missing) throw error
    return null
  })
  if (db) {
    try {
      const tx = db.transaction(['exercises', 'reviews'], 'readonly')
      const [exercises, reviews] = await Promise.all([
        read(tx.objectStore('exercises').getAll()),
        read(tx.objectStore('reviews').getAll()),
      ])
      await importArchive({ format: 'mathutando-1', exercises, reviews })
    } finally {
      db.close()
    }
  }
  localStorage.setItem(marker, '1')
}
export function migrateOnce() {
  return (pending ??= migrate().catch((error) => {
    pending = undefined
    throw error
  }))
}
