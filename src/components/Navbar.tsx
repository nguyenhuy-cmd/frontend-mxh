import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Avatar } from './Avatar'

export function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand">
          <span className="brand-logo">K</span>
          Kết Nối
        </Link>

        <nav className="nav-links">
          <NavLink to="/" end>
            Trang chủ
          </NavLink>
          {user && <NavLink to="/profile">Trang cá nhân</NavLink>}
        </nav>

        {user ? (
          <div className="nav-user">
            <Link to="/profile" className="nav-user-info">
              <Avatar name={user.username} size={34} />
              <span className="nav-username">{user.username}</span>
            </Link>
            <button type="button" className="btn btn-ghost" onClick={handleLogout}>
              Đăng xuất
            </button>
          </div>
        ) : (
          <div className="nav-user">
            <Link to="/login" className="btn btn-ghost">
              Đăng nhập
            </Link>
            <Link to="/register" className="btn btn-primary">
              Đăng ký
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}
