import { useEffect, useRef, useState } from 'react'
import type { Exercise, Stroke } from '../../../shared/exercise'
import { api, errorMessage } from '../api'

export function useDraft(exercise: Exercise) {
  const current = useRef(exercise.strokes),
    saved = useRef(exercise.strokes),
    revision = useRef(exercise.revision)
  const running = useRef<Promise<void> | null>(null)
  const [strokes, setStrokes] = useState(current.current)
  const [status, setStatus] = useState('Guardado')
  function flush(): Promise<void> {
    if (running.current) return running.current
    running.current = (async () => {
      while (saved.current !== current.current) {
        const snapshot = current.current
        const result = await api.save(exercise.id, revision.current, snapshot)
        saved.current = snapshot
        revision.current = result.revision
      }
      setStatus('Guardado')
    })()
      .catch((e) => {
        setStatus(errorMessage(e))
        throw e
      })
      .finally(() => {
        running.current = null
      })
    return running.current
  }
  function edit(next: Stroke[]) {
    current.current = next
    setStrokes(next)
    setStatus('A guardar…')
    void flush().catch(() => {})
  }
  useEffect(() => {
    const before = (e: BeforeUnloadEvent) => {
      if (current.current !== saved.current) e.preventDefault()
    }
    window.addEventListener('beforeunload', before)
    return () => window.removeEventListener('beforeunload', before)
  }, [])
  return { strokes, edit, status, flush }
}
