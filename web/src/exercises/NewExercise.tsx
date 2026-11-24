import { useEffect, useRef, useState } from 'react'
import type { Statement } from '../../../shared/exercise'
import { api, errorMessage } from '../api'

async function readImage(file: File): Promise<Statement> {
  const type = file.type
  if (type !== 'image/png' && type !== 'image/jpeg' && type !== 'image/webp')
    throw new Error('Escolhe uma imagem PNG, JPEG ou WebP.')
  if (file.size > 6 * 1024 * 1024)
    throw new Error('Escolhe uma imagem até 6 MB.')
  const data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result).split(',')[1])
    reader.onerror = () => reject(new Error('Não foi possível ler a imagem.'))
    reader.readAsDataURL(file)
  })
  return { kind: 'image', name: file.name, data, mime: type }
}

export function NewExercise({
  close,
  open,
}: {
  close: () => void
  open: (id: string) => void
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [image, setImage] = useState<Extract<
    Statement,
    { kind: 'image' }
  > | null>(null)
  const [text, setText] = useState(''),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false)
  const token = useRef(0)
  useEffect(() => {
    const el = dialog.current!
    el.showModal()
    return () => el.close()
  }, [])
  async function choose(file: File) {
    const n = ++token.current
    setError('')
    setBusy(true)
    try {
      const input = await readImage(file)
      if (n === token.current && input.kind === 'image') setImage(input)
    } catch (e) {
      if (n === token.current) setError(errorMessage(e))
    } finally {
      if (n === token.current) setBusy(false)
    }
  }
  async function create() {
    if (busy) return
    setBusy(true)
    setError('')
    try {
      const result = await api.create(image ?? { kind: 'text', text })
      open(result.id)
    } catch (e) {
      setError(errorMessage(e))
      setBusy(false)
    }
  }
  return (
    <dialog
      ref={dialog}
      onCancel={close}
      aria-labelledby="import-title"
      onPaste={(e) => {
        const file = Array.from(e.clipboardData.files).find((f) =>
          f.type.startsWith('image/'),
        )
        if (file) {
          e.preventDefault()
          void choose(file)
        }
      }}
    >
      <header>
        <h2 id="import-title">Novo exercício</h2>
        <button className="icon" aria-label="Fechar" onClick={close}>
          ×
        </button>
      </header>
      <label className="upload">
        {image ? (
          <img
            alt="Enunciado escolhido"
            src={`data:${image.mime};base64,${image.data}`}
          />
        ) : (
          <strong>Carregar ou colar imagem</strong>
        )}
        <small>
          {image ? 'Escolher outra imagem' : 'PNG, JPEG ou WebP · até 6 MB'}
        </small>
        <input
          aria-label="Carregar imagem"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={(e) => {
            if (e.target.files?.[0]) void choose(e.target.files[0])
          }}
        />
      </label>
      {image ? (
        <button className="link" onClick={() => setImage(null)}>
          Usar enunciado em texto
        </button>
      ) : (
        <label className="text-label">
          Ou cola o enunciado
          <textarea
            autoFocus
            maxLength={20000}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </label>
      )}
      {error && <p role="alert">{error}</p>}
      <button
        className="primary wide"
        disabled={busy || (!image && !text.trim())}
        onClick={create}
      >
        Abrir folha de resolução
      </button>
    </dialog>
  )
}
