import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { deletePost, fetchPost, updatePost } from '../api/social'
import { Avatar } from '../components/Avatar'
import { CommentSection } from '../components/CommentSection'
import { ErrorBox, Spinner } from '../components/Feedback'
import { PostForm, type PostDraft } from '../components/PostForm'
import { useAuth } from '../context/AuthContext'
import type { Post } from '../types'
import { getAuthorId, getAuthorName, timeAgo } from '../utils/format'

export function PostDetailPage() {
  const { id = '' } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(false)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setPost(await fetchPost(id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tải được bài viết')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    void load()
  }, [load])

  const handleUpdate = async (draft: PostDraft) => {
    if (!post) return
    setBusy(true)
    setError('')
    try {
      const updated = await updatePost(post._id, draft)
      setPost({ ...post, ...updated })
      setEditing(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không cập nhật được bài viết')
    } finally {
      setBusy(false)
    }
  }

  const handleDelete = async () => {
    if (!post) return
    if (!window.confirm(`Xóa bài viết "${post.title}"?`)) return
    setBusy(true)
    try {
      await deletePost(post._id)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không xóa được bài viết')
      setBusy(false)
    }
  }

  if (loading) return <Spinner label="Đang tải bài viết..." />

  if (!post) {
    return (
      <div className="page">
        <ErrorBox message={error || 'Không tìm thấy bài viết.'} />
        <Link className="btn btn-secondary" to="/">
          ← Quay về trang chủ
        </Link>
      </div>
    )
  }

  const authorName = getAuthorName(post.author)
  const isOwner = !!user && getAuthorId(post.author) === user.id
  const isAdmin = user?.role === 'admin'

  return (
    <div className="page detail-page">
      <ErrorBox message={error} />

      {editing ? (
        <PostForm
          initial={{ title: post.title, content: post.content }}
          submitLabel="Lưu thay đổi"
          busy={busy}
          onSubmit={handleUpdate}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <article className="card post-detail">
          <div className="post-head">
            <Avatar name={authorName} />
            <div className="post-meta">
              <span className="post-author">{authorName}</span>
              <span className="post-time">{timeAgo(post.createdAt)}</span>
            </div>
            {(isOwner || isAdmin) && (
              <div className="post-actions">
                {isOwner && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => setEditing(true)}
                    disabled={busy}
                  >
                    Sửa
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-danger-ghost btn-sm"
                  onClick={() => void handleDelete()}
                  disabled={busy}
                >
                  Xóa
                </button>
              </div>
            )}
          </div>

          <h1 className="detail-title">{post.title}</h1>
          <p className="detail-content">{post.content}</p>
        </article>
      )}

      <CommentSection postId={post._id} />
    </div>
  )
}
