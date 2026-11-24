import { useState } from 'react'
import type { Exercise } from '../../../shared/exercise'
import { api, errorMessage } from '../api'
import { Home } from './Home'
import { Workspace } from './Workspace'

export function ExerciseLibrary() {
  const [exercise, setExercise] = useState<Exercise | null>(null),
    [error, setError] = useState('')
  async function open(id: string) {
    try {
      setExercise(await api.get(id))
      setError('')
    } catch (e) {
      setError(errorMessage(e))
    }
  }
  return (
    <>
      {error && <p role="alert">{error}</p>}
      {exercise ? (
        <Workspace
          key={exercise.id}
          exercise={exercise}
          home={() => setExercise(null)}
        />
      ) : (
        <Home open={open} />
      )}
    </>
  )
}
