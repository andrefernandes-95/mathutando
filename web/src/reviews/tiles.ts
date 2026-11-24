import type { Stroke, Point } from '../../../shared/exercise'

const side = 768,
  margin = 16
export const tileSize = side + margin * 2
export type Tile = { id: string; left: number; top: number; png: string }

export function renderTiles(strokes: Stroke[]): Tile[] {
  const cells = new Map<
    string,
    { left: number; top: number; strokes: Set<Stroke> }
  >()
  for (const stroke of strokes) {
    function mark(p: Point) {
      const col = Math.floor(p.x / side),
        row = Math.floor(p.y / side),
        key = col + ',' + row
      if (!cells.has(key)) {
        if (cells.size >= 20)
          throw Error('A folha ocupa demasiadas zonas para um pedido.')
        cells.set(key, {
          left: col * side - margin,
          top: row * side - margin,
          strokes: new Set(),
        })
      }
      cells.get(key)!.strokes.add(stroke)
    }
    mark(stroke.points[0])
    for (let i = 1; i < stroke.points.length; i++) {
      const a = stroke.points[i - 1],
        b = stroke.points[i]
      const n = Math.max(
        1,
        Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / margin),
      )
      for (let j = 1; j <= n; j++)
        mark({ x: a.x + ((b.x - a.x) * j) / n, y: a.y + ((b.y - a.y) * j) / n })
    }
  }
  return Array.from(cells, ([id, { left, top, strokes }]) => {
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = tileSize
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, tileSize, tileSize)
    ctx.translate(-left, -top)
    ctx.lineWidth = 3
    ctx.strokeStyle = ctx.fillStyle = '#192d32'
    ctx.lineJoin = ctx.lineCap = 'round'
    for (const { points } of strokes) {
      const [first] = points
      ctx.beginPath()
      if (points.length === 1) {
        ctx.arc(first.x, first.y, 1.5, 0, 2 * Math.PI)
        ctx.fill()
        continue
      }
      ctx.moveTo(first.x, first.y)
      for (const p of points.slice(1)) ctx.lineTo(p.x, p.y)
      ctx.stroke()
    }
    return { id, left, top, png: canvas.toDataURL('image/png').split(',')[1] }
  })
}
