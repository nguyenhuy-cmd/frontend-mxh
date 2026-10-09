import { useCallback, useEffect, useState } from 'react'
import { deletePost, fetchPosts, updatePost } from '../api/social'
import { Avatar } from '../components/Avatar'
import { EmptyState, ErrorBox, Spinner } from '../components/Feedback'
import { Pagination } from '../components/Pagination'
import { PostCard } from '../components/PostCard'
import { PostForm, type PostDraft } from '../components/PostForm'
import { useAuth } from '../context/AuthContext'
import type { Meta, Post } from '../types'

const PAGE_SIZE = 10

export function ProfilePage() {
  const { user } = useAuth()

  const [posts, setPosts] = useState<Post[]>([])
  const [meta, setMeta] = useState<Meta | null>(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState<Post | null>(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(
    async (targetPage: number) => {
      if (!user) return
      setLoading(true)
      setError('')
      try {
        const data = await fetchPosts({
          current: targetPage,
          limit: PAGE_SIZE,
          author: user.id,
        })
        setPosts(data.result ?? [])
        setMeta(data.meta ?? null)
        setPage(data.meta?.current ?? targetPage)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Không tải được bài viết')
      } finally {
        setLoading(false)
      }
    },
    [user],
  )

  useEffect(() => {
    void load(1)
  }, [load])

  const handleUpdate = async (draft: PostDraft) => {
    if (!editing) return
    setBusy(true)
    setError('')
    try {
      const updated = await updatePost(editing._id, draft)
      setPosts((prev) =>
        prev.map((p) => (p._id === updated._id ? { ...p, ...updated } : p)),
      )
      setEditing(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không cập nhật được bài viết')
    } finally {
      setBusy(false)
    }
  }

  const handleDelete = async (post: Post) => {
    if (!window.confirm(`Xóa bài viết "${post.title}"?`)) return
    try {
      await deletePost(post._id)
      setPosts((prev) => prev.filter((p) => p._id !== post._id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không xóa được bài viết')
    }
  }

  if (!user) return null

  return (
    <div className="page profile-page">
      <header className="card profile-card">
        <Avatar name={user.username} size={72} />
        <div className="profile-info">
          <h1>{user.username}</h1>
          <p className="muted">{user.email}</p>
          <p className="profile-role">
            Vai trò: <strong>{user.role === 'admin' ? 'Quản trị viên' : 'Thành viên'}</strong>
            {meta?.total !== undefined && (
              <>
                {' · '}
                <strong>{meta.total}</strong> bài viết
              </>
            )}
          </p>
        </div>
      </header>

      <h2 className="section-title">Bài viết của tôi</h2>

      {editing && (
        <PostForm
          initial={{ title: editing.title, content: editing.content }}
          submitLabel="Lưu thay đổi"
          busy={busy}
          onSubmit={handleUpdate}
          onCancel={() => setEditing(null)}
        />
      )}

      <ErrorBox message={error} />

      {loading ? (
        <Spinner label="Đang tải bài viết..." />
      ) : posts.length === 0 ? (
        <EmptyState message="Bạn chưa đăng bài viết nào." />
      ) : (
        <div className="post-list">
          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              currentUserId={user.id}
              currentUserRole={user.role}
              onEdit={setEditing}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {meta && meta.pages > 1 && (
        <Pagination
          current={page}
          pages={meta.pages}
          onChange={(next) => void load(next)}
        />
      )}
    </div>
  )
}
