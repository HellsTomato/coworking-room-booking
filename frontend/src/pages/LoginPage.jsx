import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { ApiError, toApiError } from '../api/errors.js'
import { useAuth } from '../auth/useAuth.js'
import { Alert } from '../components/Alert.jsx'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const from = location.state?.from || '/rooms'

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!email.trim() || !password) {
      setError(
        new ApiError({
          status: 400,
          code: 'VALIDATION_ERROR',
          message: 'Введите email и пароль.',
        }),
      )
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      await login({ email: email.trim(), password })
      navigate(from, { replace: true })
    } catch (loginError) {
      setError(loginError instanceof ApiError ? loginError : toApiError(loginError))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <p className="eyebrow">FR-1 · вход и JWT</p>
        <h1>Вход в систему</h1>
        <p className="muted">Войдите, чтобы бронировать комнаты и видеть свои заявки.</p>

        {location.state?.registered ? (
          <Alert tone="success" title="Регистрация завершена">
            <p>Теперь войдите с тем же email и паролем.</p>
          </Alert>
        ) : null}

        {error ? (
          <Alert tone="error" title="Не удалось войти">
            <p>{error.message}</p>
            {error.serverMessage ? <p className="alert__hint">Ответ сервера: {error.serverMessage}</p> : null}
          </Alert>
        ) : null}

        <form className="form" onSubmit={handleSubmit} noValidate>
          <label className="field">
            <span className="field__label">Email</span>
            <input
              className="field__input"
              type="email"
              autoComplete="email"
              placeholder="anna@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>

          <label className="field">
            <span className="field__label">Пароль</span>
            <input
              className="field__input"
              type="password"
              autoComplete="current-password"
              placeholder="Secret123!"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>

          <button type="submit" className="button" disabled={submitting}>
            {submitting ? 'Входим…' : 'Войти'}
          </button>
        </form>

        <p className="auth-card__footer">
          Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
        </p>

        <div className="demo-hint">
          <p className="demo-hint__title">Демонстрационный режим (VITE_MOCK_API=true)</p>
          <p>
            Сотрудник: <code>employee@example.com</code> / <code>Secret123!</code>
          </p>
          <p>
            Администратор: <code>admin@example.com</code> / <code>Secret123!</code>
          </p>
        </div>
      </div>
    </div>
  )
}
