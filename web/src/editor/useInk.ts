import { useRef, useState, type PointerEvent } from 'react'
import type { Point, Stroke } from '../../../shared/exercise'
import { documentPoint, hits, type Camera } from './geometry'

type Tool = 'pen' | 'eraser'
type Gesture = { id: number; type: string; tool: Tool; points: Point[] }
type Props = {
  strokes: Stroke[]
  camera: Camera
  tool: Tool
  readOnly: boolean
  space: boolean
  onEdit: (strokes: Stroke[]) => void
  move: (x: number, y: number) => void
}

export function useInk({
  strokes,
  camera,
  tool,
  readOnly,
  space,
  onEdit,
  move,
}: Props) {
  const pointers = useRef(new Map<number, Point>())
  const gesture = useRef<Gesture | null>(null)
  const pen = useRef<number | null>(null)
  const pan = useRef(false)
  const [preview, setPreview] = useState<Point[]>([])
  const local = (e: PointerEvent<SVGSVGElement>) => {
    const box = e.currentTarget.getBoundingClientRect()
    return { x: e.clientX - box.left, y: e.clientY - box.top }
  }
  function cancelInk() {
    gesture.current = null
    setPreview([])
  }
  function down(e: PointerEvent<SVGSVGElement>) {
    if (e.button !== 0 && e.button !== 1) return
    e.currentTarget.setPointerCapture(e.pointerId)
    if (e.pointerType === 'touch' && pen.current !== null) return
    const pos = local(e)
    if (e.pointerType === 'pen') {
      pointers.current.clear()
      cancelInk()
      pen.current = e.pointerId
      pan.current = false
    }
    pointers.current.set(e.pointerId, pos)
    if (pointers.current.size >= 2 || space || readOnly || e.button === 1) {
      cancelInk()
      pan.current = true
      return
    }
    const points = [documentPoint(pos, camera)]
    gesture.current = { id: e.pointerId, type: e.pointerType, tool, points }
    if (tool === 'pen') setPreview(points)
  }
  function motion(e: PointerEvent<SVGSVGElement>) {
    const previous = pointers.current.get(e.pointerId)
    if (!previous) return
    const pos = local(e)
    pointers.current.set(e.pointerId, pos)
    if (pan.current) {
      if (pointers.current.size >= 2 || readOnly || e.pointerType !== 'touch')
        move(
          (pos.x - previous.x) / pointers.current.size,
          (pos.y - previous.y) / pointers.current.size,
        )
      return
    }
    const ink = gesture.current
    if (ink?.id !== e.pointerId) return
    const p = documentPoint(pos, camera)
    const last = ink.points.at(-1)!
    if (Math.hypot(last.x - p.x, last.y - p.y) * camera.scale < 1) return
    ink.points.push(p)
    if (ink.tool === 'pen') setPreview([...ink.points])
  }
  function end(e: PointerEvent<SVGSVGElement>, cancelled = false) {
    if (!pointers.current.has(e.pointerId)) return
    if (!cancelled) motion(e)
    const ink = gesture.current
    if (ink?.id === e.pointerId) {
      if (!cancelled && ink.tool === 'pen')
        onEdit([...strokes, { id: crypto.randomUUID(), points: ink.points }])
      if (!cancelled && ink.tool === 'eraser')
        onEdit(
          strokes.filter(
            (s) => !ink.points.some((p) => hits(s, p, 9 / camera.scale)),
          ),
        )
      cancelInk()
    }
    pointers.current.delete(e.pointerId)
    if (pen.current === e.pointerId) pen.current = null
    if (!pointers.current.size) pan.current = false
  }
  return {
    preview,
    events: {
      onPointerDown: down,
      onPointerMove: motion,
      onPointerUp: (e: PointerEvent<SVGSVGElement>) => end(e),
      onPointerCancel: (e: PointerEvent<SVGSVGElement>) => end(e, true),
    },
  }
}
