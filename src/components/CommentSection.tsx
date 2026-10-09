import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { createComment, deleteComment, fetchComments } from '../api/social'
import { useAuth } from '../context/AuthContext'
import type { Comment } from '../types'
import { getAuthorId, getAuthorName, timeAgo } from '../utils/format'
import { Avatar } from './Avatar'
import { EmptyState, ErrorBox, Spinner } from './Feedback'

const PAGE_SIZE = 20

export function CommentSection({ postId }: { postId: string }) {
  const { user } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)

  const load = useCallback(
    async (targetPage: number) => {
      setLoading(true)
      setError('')
      try {
        const data = await fetchComments(postId, targetPage, PAGE_SIZE)
        setComments(data.result ?? [])
        setPages(Math.max(1, data.meta?.pages ?? 1))
        setPage(data.meta?.current ?? targetPage)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Không tải được bình luận')
      } finally {
        setLoading(false)
      }
    },
    [postId],
  )

  useEffect(() => {
    void load(1)
  }, [load])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const content = text.trim()
    if (!content || busy) return

    setBusy(true)
    setError('')
    try {
      const created = await createComment(postId, content)
      setComments((prev) => [created, ...prev])
      setText('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không gửi được bình luận')
    } finally {
      setBusy(false)
    }
  }

  const handleDelete = async (comment: Comment) => {
    if (!window.confirm('Xóa bình luận này?')) return
    try {
      await deleteComment(comment._id)
      setComments((prev) => prev.filter((c) => c._id !== comment._id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không xóa được bình luận')
    }
  }

  return (
    <section className="card comment-section">
      <h3 className="section-title">Bình luận</h3>

      {user ? (
        <form className="comment-form" onSubmit={handleSubmit}>
          <Avatar name={user.username} size={36} />
          <input
            className="input"
            type="text"
            placeholder="Viết bình luận..."
            value={text}
            maxLength={500}
            onChange={(e) => setText(e.target.value)}
          />
          <button
            type="submit"
            className="btn btn-primary btn-sm"
            disabled={busy || !text.trim()}
          >
            {busy ? '...' : 'Gửi'}
          </button>
        </form>
      ) : (
        <p className="muted">Đăng nhập để viết bình luận.</p>
      )}

      <ErrorBox message={error} />

      {loading ? (
        <Spinner label="Đang tải bình luận..." />
      ) : comments.length === 0 ? (
        <EmptyState message="Chưa có bình luận nào." />
      ) : (
        <ul className="comment-list">
          {comments.map((comment) => {
            const name = getAuthorName(comment.author)
            const isOwner =
              (!!user && getAuthorId(comment.author) === user.id) ||
              user?.role === 'admin'
            return (
              <li key={comment._id} className="comment-item">
                <Avatar name={name} size={34} />
                <div className="comment-body">
                  <div className="comment-head">
                    <span className="comment-author">{name}</span>
                    <span className="post-time">{timeAgo(comment.createdAt)}</span>
                    {isOwner && (
                      <button
                        type="button"
                        className="btn btn-danger-ghost btn-xs"
                        onClick={() => void handleDelete(comment)}
                      >
                        Xóa
                      </button>
                    )}
                  </div>
                  <p className="comment-content">{comment.content}</p>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {pages > 1 && (
        <div className="pagination">
          <button
            type="button"
            className="btn btn-ghost"
            disabled={page <= 1}
            onClick={() => void load(page - 1)}
          >
            ← Trước
          </button>
          <span className="page-info">
            {page}/{pages}
          </span>
          <button
            type="button"
            className="btn btn-ghost"
            disabled={page >= pages}
            onClick={() => void load(page + 1)}
          >
            Sau →
          </button>
        </div>
      )}
    </section>
  )
}
