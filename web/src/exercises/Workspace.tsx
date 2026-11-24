import { useState } from 'react'
import type { Exercise, Review } from '../../../shared/exercise'
import { DrawingBoard } from '../editor/DrawingBoard'
import { useDraft } from '../editor/useDraft'
import { useReviews } from '../reviews/useReviews'
import { ReviewTimeline } from '../reviews/ReviewTimeline'

const localReviewsAvailable = import.meta.env.MODE !== 'pages'

export function Workspace({
  exercise,
  home,
}: {
  exercise: Exercise
  home: () => void
}) {
  const draft = useDraft(exercise),
    reviews = useReviews(exercise)
  const [tab, setTab] = useState<'Enunciado' | 'Resolução'>('Resolução')
  const [snapshot, setSnapshot] = useState<string | null>(null)
  const [visible, setVisible] = useState(true),
    [notice, setNotice] = useState('')
  const opened = reviews.history.find((v) => v.id === snapshot)
  const latest = reviews.history[0]
  const overlay =
    opened ?? reviews.history.find((v) => v.feedback?.format === 'hints-v1')
  const failed =
    opened?.state === 'failed'
      ? opened
      : !opened && latest?.state === 'failed'
        ? latest
        : undefined
  const notes = visible
    ? (overlay?.feedback?.notes.filter((n) => n.point) ?? [])
    : []
  const source = exercise.statement
  function ask(retry?: Review) {
    setNotice('')
    setSnapshot(null)
    setTab('Resolução')
    setVisible(true)
    void reviews.submit(draft.strokes, retry)
  }
  function select(version: Review) {
    setSnapshot(version.id)
    setVisible(true)
    setTab('Resolução')
  }
  async function leave() {
    try {
      await draft.flush()
      home()
    } catch {
      setNotice('A gravação falhou. Volta a tentar antes de sair.')
    }
  }
  return (
    <main className="workspace">
      <header className="work-head">
        <button
          className="back"
          onClick={leave}
          aria-label="Voltar aos exercícios"
        >
          ←
        </button>
        <h1>{exercise.title}</h1>
        <button
          className="primary request-review"
          disabled={
            !localReviewsAvailable ||
            reviews.busy ||
            !draft.strokes.length ||
            !!opened
          }
          onClick={() => ask()}
        >
          {reviews.busy && <span className="spinner" aria-hidden="true" />}
          {!localReviewsAvailable
            ? 'Revisão só na app local'
            : reviews.busy
              ? 'A rever…'
              : 'Pedir revisão'}
        </button>
      </header>
      <span className="sr-only" role="status">
        {reviews.busy ? 'A OpenAI está a rever o desenho.' : ''}
      </span>
      <nav className="tabs" aria-label="Exercício">
        {(['Enunciado', 'Resolução'] as const).map((t) => (
          <button
            key={t}
            aria-current={tab === t ? 'page' : undefined}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </nav>
      {(notice || reviews.error) && (
        <p role="alert">{notice || reviews.error}</p>
      )}
      {failed && (
        <div className="notice" role="status">
          {failed.error}{' '}
          {localReviewsAvailable && (
            <button disabled={reviews.busy} onClick={() => ask(failed)}>
              Repetir revisão
            </button>
          )}
        </div>
      )}
      <div className="work-body" data-tab={tab}>
        <aside className="statement">
          <h2>Enunciado</h2>
          {source.kind === 'text' ? (
            <p>{source.text}</p>
          ) : (
            <img
              alt="Enunciado original"
              src={`data:${source.mime};base64,${source.data}`}
            />
          )}
          <ReviewTimeline
            history={reviews.history}
            selected={snapshot ?? undefined}
            select={select}
          />
        </aside>
        <section className="draft">
          <div className="section-head">
            <h2>
              {opened
                ? 'Versão ' +
                  (reviews.history.length - reviews.history.indexOf(opened))
                : 'Resolução'}
            </h2>
            {opened ? (
              <button className="quiet" onClick={() => setSnapshot(null)}>
                Voltar ao desenho
              </button>
            ) : (
              <small role="status">{draft.status}</small>
            )}
            {overlay?.feedback?.notes.some((n) => n.point) && (
              <button
                className="quiet"
                aria-pressed={visible}
                onClick={() => setVisible((v) => !v)}
              >
                {visible ? 'Ocultar revisão' : 'Mostrar revisão'}
              </button>
            )}
          </div>
          <div className="board-slot" hidden={!!opened}>
            <DrawingBoard
              strokes={draft.strokes}
              onEdit={draft.edit}
              notes={opened ? [] : notes}
              overlayId={visible ? overlay?.id : undefined}
            />
          </div>
          {opened && (
            <div className="board-slot">
              <DrawingBoard
                key={opened.id}
                strokes={opened.strokes}
                notes={notes}
                overlayId={visible ? opened.id : undefined}
              />
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
