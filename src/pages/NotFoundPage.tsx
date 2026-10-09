import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="page not-found">
      <h1>404</h1>
      <p className="muted">Trang bạn tìm không tồn tại.</p>
      <Link className="btn btn-primary" to="/">
        Về trang chủ
      </Link>
    </div>
  )
}
