import type { Review } from '../../../shared/exercise'
export function ReviewTimeline({
  history,
  selected,
  select,
}: {
  history: Review[]
  selected?: string
  select: (v: Review) => void
}) {
  if (!history.length) return null
  return (
    <section className="snapshot-timeline" aria-label="Versões guardadas">
      <h3>Versões guardadas</h3>
      <ol>
        {history.map((v, i) => (
          <li key={v.id}>
            <button aria-pressed={v.id === selected} onClick={() => select(v)}>
              <span>Versão {history.length - i}</span>
              <small>
                {v.state === 'pending'
                  ? 'A rever…'
                  : v.state === 'failed'
                    ? 'Por rever'
                    : new Date(v.created).toLocaleTimeString('pt-PT', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
              </small>
            </button>
          </li>
        ))}
      </ol>
    </section>
  )
}
