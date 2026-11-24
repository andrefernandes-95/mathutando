import { useEffect, useRef, useState } from 'react'
import type { Feedback, Point, Stroke } from '../../../shared/exercise'
import { fit, initialCamera } from './geometry'
import { useInk } from './useInk'

function Line({ points }: { points: Point[] }) {
  return points.length === 1 ? (
    <circle cx={points[0].x} cy={points[0].y} r="1.5" fill="currentColor" />
  ) : (
    <polyline
      points={points.map((p) => p.x + ',' + p.y).join(' ')}
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  )
}
type Props = {
  strokes: Stroke[]
  onEdit?: (s: Stroke[]) => void
  overlayId?: string
  notes?: Feedback['notes']
}
export function DrawingBoard({
  strokes,
  onEdit,
  notes = [],
  overlayId,
}: Props) {
  const board = useRef<HTMLDivElement>(null)
  const [camera, setCamera] = useState(initialCamera)
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen')
  const [space, setSpace] = useState(false)
  const [selected, setSelected] = useState<number | null>(null)
  useEffect(() => setSelected(null), [overlayId])
  const initialStrokes = useRef(strokes)
  useEffect(() => {
    const el = board.current!
    if (initialStrokes.current.length)
      setCamera(fit(initialStrokes.current, el.clientWidth, el.clientHeight))
    function key(e: KeyboardEvent) {
      if (
        e.code === 'Space' &&
        (e.target === el || e.target === document.body)
      ) {
        e.preventDefault()
        setSpace(e.type === 'keydown')
      } else if (e.code === 'Space' && e.type === 'keyup') setSpace(false)
    }
    const blur = () => setSpace(false)
    window.addEventListener('keydown', key)
    window.addEventListener('keyup', key)
    window.addEventListener('blur', blur)
    return () => {
      window.removeEventListener('keydown', key)
      window.removeEventListener('keyup', key)
      window.removeEventListener('blur', blur)
    }
  }, [])
  const { preview, events } = useInk({
    strokes,
    camera,
    tool,
    space,
    readOnly: !onEdit,
    onEdit: (s) => onEdit?.(s),
    move: (x, y) => setCamera((c) => ({ ...c, x: c.x + x, y: c.y + y })),
  })
  function zoom(factor: number) {
    const el = board.current!
    setCamera((c) => {
      const scale = Math.min(5, Math.max(0.1, c.scale * factor)),
        ratio = scale / c.scale
      return {
        scale,
        x: el.clientWidth / 2 - (el.clientWidth / 2 - c.x) * ratio,
        y: el.clientHeight / 2 - (el.clientHeight / 2 - c.y) * ratio,
      }
    })
  }
  return (
    <div
      className="sheet"
      ref={board}
      tabIndex={0}
      aria-label="Folha de resolução"
      style={{
        backgroundPosition: `${camera.x}px ${camera.y}px`,
        backgroundSize: `${22 * camera.scale}px ${22 * camera.scale}px`,
      }}
    >
      <svg
        className="ink"
        aria-label="Desenho livre"
        {...events}
        onPointerDown={(e) => {
          board.current?.focus({ preventScroll: true })
          events.onPointerDown(e)
        }}
      >
        <g
          transform={`translate(${camera.x} ${camera.y}) scale(${camera.scale})`}
        >
          {strokes.map((s) => (
            <Line key={s.id} points={s.points} />
          ))}
          {preview.length > 0 && <Line points={preview} />}
        </g>
      </svg>
      {notes.map(
        (note, i) =>
          note.point && (
            <button
              className="pin"
              key={i}
              style={{
                left: camera.x + note.point.x * camera.scale,
                top: camera.y + note.point.y * camera.scale,
              }}
              aria-label={'Comentário ' + (i + 1)}
              aria-expanded={selected === i}
              onClick={() => setSelected(selected === i ? null : i)}
            >
              {i + 1}
            </button>
          ),
      )}
      {selected !== null && notes[selected]?.point && (
        <div
          className="tooltip"
          role="status"
          style={{
            left: Math.max(
              8,
              Math.min(
                (board.current?.clientWidth ?? 300) - 238,
                camera.x + notes[selected].point!.x * camera.scale,
              ),
            ),
            top: Math.max(
              8,
              Math.min(
                (board.current?.clientHeight ?? 250) - 120,
                camera.y + notes[selected].point!.y * camera.scale + 16,
              ),
            ),
          }}
        >
          <button
            aria-label="Fechar comentário"
            onClick={() => setSelected(null)}
          >
            ×
          </button>
          {notes[selected].text}
        </div>
      )}
      <div className="tools">
        {onEdit && (
          <>
            <button
              aria-pressed={tool === 'pen'}
              onClick={() => setTool('pen')}
            >
              Caneta
            </button>
            <button
              aria-pressed={tool === 'eraser'}
              onClick={() => setTool('eraser')}
            >
              Borracha
            </button>
          </>
        )}
        <button aria-label="Reduzir" onClick={() => zoom(0.8)}>
          −
        </button>
        <button aria-label="Ampliar" onClick={() => zoom(1.25)}>
          +
        </button>
        <button
          onClick={() => {
            const el = board.current!
            setCamera(fit(strokes, el.clientWidth, el.clientHeight))
          }}
        >
          Enquadrar
        </button>
      </div>
    </div>
  )
}
