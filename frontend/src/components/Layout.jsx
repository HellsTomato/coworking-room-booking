import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'

import { useAuth } from '../auth/useAuth.js'

const navClass = ({ isActive }) => (isActive ? 'nav__link nav__link--active' : 'nav__link')

export function Layout() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <Link to="/rooms" className="brand">
          <span className="brand__mark" aria-hidden="true">
            CR
          </span>
          <span>
            Coworking
            <small>Room Booking</small>
          </span>
        </Link>

        <nav className="nav" aria-label="Основная навигация">
          <NavLink to="/rooms" className={navClass}>
            Каталог
          </NavLink>
          {isAuthenticated ? (
            <NavLink to="/bookings" end className={navClass}>
              Мои брони
            </NavLink>
          ) : null}
          {isAdmin ? (
            <NavLink to="/admin/rooms" className={navClass}>
              Админ-панель
            </NavLink>
          ) : null}
        </nav>

        <div className="site-header__account">
          {isAuthenticated ? (
            <>
              <span className="account__name">{user?.fullName || user?.email}</span>
              <span className="account__role">{isAdmin ? 'администратор' : 'сотрудник'}</span>
              <button type="button" className="button button--ghost" onClick={handleLogout}>
                Выйти
              </button>
            </>
          ) : (
            <Link className="button button--ghost" to="/login">
              Войти
            </Link>
          )}
        </div>
      </header>

      <main className="site-main">
        <Outlet />
      </main>

      <footer className="site-footer">
        <span>Coworking Room Booking System</span>
        <span>ЛР №2–4 · React, Vite, Axios</span>
      </footer>
    </div>
  )
}
