import { useEffect, useRef, useState } from 'react'
import type { Exercise, Review, Stroke } from '../../../shared/exercise'
import { library } from '../storage/library'
import { errorMessage } from '../api'
import { recoverInterrupted, requestReview, subscribe } from './jobs'

export function useReviews(exercise: Exercise) {
  const [history, setHistory] = useState<Review[]>([])
  const [starting, setStarting] = useState(false),
    [error, setError] = useState('')
  const lock = useRef(false)
  useEffect(() => {
    let active = true,
      token = 0
    async function refresh() {
      const revision = ++token
      try {
        const rows = await library.history(exercise.id)
        if (active && revision === token) setHistory(rows)
      } catch (e) {
        if (active) setError(errorMessage(e))
      }
    }
    const stop = subscribe(exercise.id, () => void refresh())
    void recoverInterrupted(exercise.id)
      .then(refresh)
      .catch((e) => {
        if (active) setError(errorMessage(e))
      })
    return () => {
      active = false
      stop()
    }
  }, [exercise.id])
  async function submit(strokes: Stroke[], previous?: Review) {
    if (lock.current) return
    lock.current = true
    setStarting(true)
    setError('')
    try {
      await requestReview(exercise, strokes, previous)
    } catch (e) {
      setError(errorMessage(e))
    } finally {
      lock.current = false
      setStarting(false)
    }
  }
  return {
    history,
    error,
    busy: starting || history.some((r) => r.state === 'pending'),
    submit,
  }
}
