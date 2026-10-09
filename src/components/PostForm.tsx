import { useState, type FormEvent } from 'react'

export interface PostDraft {
  title: string
  content: string
}

interface PostFormProps {
  initial?: PostDraft
  submitLabel: string
  busy?: boolean
  onSubmit: (draft: PostDraft) => Promise<void> | void
  onCancel?: () => void
}

export function PostForm({
  initial,
  submitLabel,
  busy = false,
  onSubmit,
  onCancel,
}: PostFormProps) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [content, setContent] = useState(initial?.content ?? '')
  const [error, setError] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const trimmedTitle = title.trim()
    const trimmedContent = content.trim()

    if (!trimmedTitle) {
      setError('Tiêu đề không được để trống')
      return
    }
    if (!trimmedContent) {
      setError('Nội dung không được để trống')
      return
    }

    setError('')
    await onSubmit({ title: trimmedTitle, content: trimmedContent })
  }

  return (
    <form className="card post-form" onSubmit={handleSubmit}>
      <input
        className="input"
        type="text"
        placeholder="Tiêu đề bài viết"
        value={title}
        maxLength={200}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        className="textarea"
        placeholder="Bạn đang nghĩ gì?"
        rows={4}
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      {error && <p className="field-error">{error}</p>}
      <div className="form-actions">
        {onCancel && (
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            Hủy
          </button>
        )}
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? 'Đang gửi...' : submitLabel}
        </button>
      </div>
    </form>
  )
}
