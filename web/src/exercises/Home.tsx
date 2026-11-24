import { useEffect, useState } from 'react'
import type { ExerciseSummary } from '../../../shared/exercise'
import { api, errorMessage } from '../api'
import { importArchive } from '../storage/archive'
import { NewExercise } from './NewExercise'

export function Home({ open }: { open: (id: string) => void }) {
  const [items, setItems] = useState<ExerciseSummary[] | null>(null),
    [error, setError] = useState('')
  const [creating, setCreating] = useState(false),
    [refresh, setRefresh] = useState(0)
  useEffect(() => {
    let live = true
    setError('')
    api
      .list()
      .then((list) => {
        if (live) setItems(list)
      })
      .catch((e) => {
        if (live) setError(errorMessage(e))
      })
    return () => {
      live = false
    }
  }, [refresh])
  return (
    <main className="home">
      <div className="mast">
        <span className="brand">
          mathutando<span>.</span>
        </span>
      </div>
      <section className="home-heading">
        <h1>Os meus exercícios</h1>
        <button className="primary" onClick={() => setCreating(true)}>
          + New Exercise
        </button>
      </section>
      {error ? (
        <p role="alert">
          {error}{' '}
          <button onClick={() => setRefresh((n) => n + 1)}>
            Tentar novamente
          </button>
        </p>
      ) : items === null ? (
        <p>A carregar…</p>
      ) : items.length === 0 ? (
        <section className="empty-grid">
          <div className="paper-mark" aria-hidden="true">
            √<span>x</span>
          </div>
          <h2>A tua folha de matemática começa aqui.</h2>
          <p>Adiciona um enunciado para começares a resolver à mão.</p>
        </section>
      ) : (
        <ul className="history">
          {items.map((e) => (
            <li key={e.id}>
              <button onClick={() => open(e.id)}>
                <span>
                  <strong>{e.title}</strong>
                  <small>
                    {new Date(e.updated).toLocaleDateString('pt-PT')} ·{' '}
                    {e.reviews} {e.reviews === 1 ? 'revisão' : 'revisões'}
                  </small>
                </span>
                <span aria-hidden="true">↗</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <label className="import-history">
        Importar histórico local
        <input
          type="file"
          accept=".json"
          onChange={async (e) => {
            const file = e.target.files?.[0]
            if (!file) return
            try {
              await importArchive(JSON.parse(await file.text()))
              setRefresh((n) => n + 1)
            } catch {
              setError('Não foi possível importar este histórico.')
            }
          }}
        />
      </label>
      {creating && <NewExercise close={() => setCreating(false)} open={open} />}
    </main>
  )
}
