import type { Point, Stroke } from '../../../shared/exercise'

export type Camera = { x: number; y: number; scale: number }
export const initialCamera: Camera = { x: 0, y: 0, scale: 1 }
export function documentPoint(point: Point, camera: Camera): Point {
  return {
    x: (point.x - camera.x) / camera.scale,
    y: (point.y - camera.y) / camera.scale,
  }
}
export function hits(stroke: Stroke, p: Point, radius: number) {
  return stroke.points.some((b, index) => {
    const a = stroke.points[Math.max(0, index - 1)],
      dx = b.x - a.x,
      dy = b.y - a.y
    const t = Math.max(
      0,
      Math.min(
        1,
        ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy || 1),
      ),
    )
    return Math.hypot(p.x - a.x - t * dx, p.y - a.y - t * dy) <= radius
  })
}
export function fit(strokes: Stroke[], width: number, height: number): Camera {
  if (!strokes.length) return initialCamera
  let left = Infinity,
    right = -Infinity,
    top = Infinity,
    bottom = -Infinity
  for (const stroke of strokes)
    for (const p of stroke.points) {
      left = Math.min(left, p.x)
      right = Math.max(right, p.x)
      top = Math.min(top, p.y)
      bottom = Math.max(bottom, p.y)
    }
  const scale = Math.min(
    1.5,
    (width - 48) / Math.max(1, right - left),
    (height - 48) / Math.max(1, bottom - top),
  )
  return {
    x: (width - (left + right) * scale) / 2,
    y: (height - (top + bottom) * scale) / 2,
    scale,
  }
}
