import { Link } from 'react-router-dom'
import type { Post } from '../types'
import { getAuthorId, getAuthorName, timeAgo } from '../utils/format'
import { Avatar } from './Avatar'

interface PostCardProps {
  post: Post
  currentUserId?: string
  currentUserRole?: string
  onDelete?: (post: Post) => void
  onEdit?: (post: Post) => void
}

export function PostCard({
  post,
  currentUserId,
  currentUserRole,
  onDelete,
  onEdit,
}: PostCardProps) {
  const authorName = getAuthorName(post.author)
  const isOwner = !!currentUserId && getAuthorId(post.author) === currentUserId
  const isAdmin = currentUserRole === 'admin'
  const canEdit = isOwner
  const canDelete = isOwner || isAdmin

  return (
    <article className="card post-card">
      <div className="post-head">
        <Avatar name={authorName} />
        <div className="post-meta">
          <span className="post-author">{authorName}</span>
          <span className="post-time">{timeAgo(post.createdAt)}</span>
        </div>
        {(canEdit || canDelete) && (onEdit || onDelete) && (
          <div className="post-actions">
            {onEdit && canEdit && (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => onEdit(post)}
              >
                Sửa
              </button>
            )}
            {onDelete && canDelete && (
              <button
                type="button"
                className="btn btn-danger-ghost btn-sm"
                onClick={() => onDelete(post)}
              >
                Xóa
              </button>
            )}
          </div>
        )}
      </div>

      <h2 className="post-title">
        <Link to={`/posts/${post._id}`}>{post.title}</Link>
      </h2>
      <p className="post-content">{post.content}</p>

      <div className="post-foot">
        <Link className="post-link" to={`/posts/${post._id}`}>
          Xem chi tiết & bình luận →
        </Link>
      </div>
    </article>
  )
}
