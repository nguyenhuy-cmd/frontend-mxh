import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ErrorBox } from '../components/Feedback'
import { useAuth } from '../context/AuthContext'

export function RegisterPage() {
  const { register, loading } = useAuth()
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (!username.trim()) {
      setError('Tên người dùng không được để trống')
      return
    }
    if (!email.trim()) {
      setError('Email không được để trống')
      return
    }
    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự')
      return
    }
    if (password !== confirm) {
      setError('Mật khẩu xác nhận không khớp')
      return
    }

    try {
      await register(username.trim(), email.trim(), password)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng ký thất bại')
    }
  }

  return (
    <div className="auth-page">
      <form className="card auth-card" onSubmit={handleSubmit}>
        <h1 className="auth-title">Tạo tài khoản</h1>
        <p className="muted">Tham gia Kết Nối chỉ trong vài giây.</p>

        <label className="field">
          <span>Tên người dùng</span>
          <input
            className="input"
            type="text"
            autoComplete="username"
            placeholder="Nguyễn Văn A"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </label>

        <label className="field">
          <span>Email</span>
          <input
            className="input"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        <label className="field">
          <span>Mật khẩu</span>
          <input
            className="input"
            type="password"
            autoComplete="new-password"
            placeholder="Tối thiểu 6 ký tự"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        <label className="field">
          <span>Xác nhận mật khẩu</span>
          <input
            className="input"
            type="password"
            autoComplete="new-password"
            placeholder="Nhập lại mật khẩu"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </label>

        <ErrorBox message={error} />

        <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
          {loading ? 'Đang đăng ký...' : 'Đăng ký'}
        </button>

        <p className="auth-switch">
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </p>
      </form>
    </div>
  )
}
