import { useCallback, useEffect, useState } from 'react'
import {
  createPost,
  deletePost,
  fetchPosts,
  updatePost,
} from '../api/social'
import { EmptyState, ErrorBox, Spinner } from '../components/Feedback'
import { Pagination } from '../components/Pagination'
import { PostCard } from '../components/PostCard'
import { PostForm, type PostDraft } from '../components/PostForm'
import { useAuth } from '../context/AuthContext'
import type { Meta, Post } from '../types'

const PAGE_SIZE = 10

export function FeedPage() {
  const { user } = useAuth()

  const [posts, setPosts] = useState<Post[]>([])
  const [meta, setMeta] = useState<Meta | null>(null)
  const [page, setPage] = useState(1)
  const [query, setQuery] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<Post | null>(null)

  const load = useCallback(
    async (targetPage: number, title: string) => {
      setLoading(true)
      setError('')
      try {
        const data = await fetchPosts({
          current: targetPage,
          limit: PAGE_SIZE,
          title: title || undefined,
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
    [],
  )

  useEffect(() => {
    void load(1, query)
  }, [load, query])

  const handleSearch = () => {
    setQuery(searchInput.trim())
  }

  const handleCreate = async (draft: PostDraft) => {
    if (!user) return
    setCreating(true)
    setError('')
    try {
      const created = await createPost({ ...draft, authorId: user.id })
      setPosts((prev) => [created, ...prev])
      setSearchInput('')
      setQuery('')
      setPage(1)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tạo được bài viết')
    } finally {
      setCreating(false)
    }
  }

  const handleUpdate = async (draft: PostDraft) => {
    if (!editing) return
    setCreating(true)
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
      setCreating(false)
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

  return (
    <div className="page feed-page">
      <form
        className="card search-bar"
        onSubmit={(e) => {
          e.preventDefault()
          handleSearch()
        }}
      >
        <input
          className="input"
          type="search"
          placeholder="Tìm bài viết theo tiêu đề..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <button type="submit" className="btn btn-secondary">
          Tìm
        </button>
        {query && (
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              setSearchInput('')
              setQuery('')
            }}
          >
            Xóa bộ lọc
          </button>
        )}
      </form>

      {editing ? (
        <PostForm
          initial={{ title: editing.title, content: editing.content }}
          submitLabel="Lưu thay đổi"
          busy={creating}
          onSubmit={handleUpdate}
          onCancel={() => setEditing(null)}
        />
      ) : (
        <PostForm submitLabel="Đăng bài" busy={creating} onSubmit={handleCreate} />
      )}

      <ErrorBox message={error} />

      {loading ? (
        <Spinner label="Đang tải bài viết..." />
      ) : posts.length === 0 ? (
        <EmptyState
          message={
            query
              ? `Không tìm thấy bài viết nào khớp "${query}".`
              : 'Chưa có bài viết nào. Hãy là người đầu tiên đăng bài!'
          }
        />
      ) : (
        <div className="post-list">
          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              currentUserId={user?.id}
              currentUserRole={user?.role}
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
          onChange={(next) => void load(next, query)}
        />
      )}
    </div>
  )
}
