import { createRoot } from 'react-dom/client'
import { ExerciseLibrary } from './exercises/ExerciseLibrary'
import './style.css'

createRoot(document.getElementById('root')!).render(<ExerciseLibrary />)
