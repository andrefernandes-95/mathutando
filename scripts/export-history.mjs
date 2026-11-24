import { DatabaseSync } from 'node:sqlite'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'

const source = process.argv[2] ?? 'data.local/exercises.sqlite'
const dest = process.argv[3] ?? 'data.local/historico.json'
const db = new DatabaseSync(source, { readOnly: true })
db.exec('BEGIN')
try {
  const exercises = db
    .prepare('SELECT * FROM exercises')
    .all()
    .map((e) => ({
      ...e,
      named: Boolean(e.named),
      statement: JSON.parse(e.statement),
      strokes: JSON.parse(e.strokes),
    }))
  const reviews = db
    .prepare('SELECT * FROM reviews')
    .all()
    .map((r) => ({
      ...r,
      feedback: r.feedback ? JSON.parse(r.feedback) : undefined,
      strokes: JSON.parse(r.strokes),
    }))
  mkdirSync(dirname(dest), { recursive: true })
  writeFileSync(
    dest,
    JSON.stringify({ format: 'mathutando-1', exercises, reviews }),
    { mode: 0o600 },
  )
  console.info(
    exercises.length +
      ' exercício(s), ' +
      reviews.length +
      ' versão(ões) exportados.',
  )
} finally {
  db.close()
}
