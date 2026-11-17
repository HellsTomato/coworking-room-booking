import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { ApiError, toApiError } from '../api/errors.js'
import { useAuth } from '../auth/useAuth.js'
import { Alert } from '../components/Alert.jsx'

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [values, setValues] = useState({ fullName: '', email: '', password: '' })
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const update = (field) => (event) => {
    const { value } = event.target
    setValues((previous) => ({ ...previous, [field]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!values.fullName.trim() || !values.email.trim() || values.password.length < 8) {
      setError(
        new ApiError({
          status: 400,
          code: 'VALIDATION_ERROR',
          message: 'Укажите имя, email и пароль не короче 8 символов.',
        }),
      )
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const user = await register({
        fullName: values.fullName.trim(),
        email: values.email.trim(),
        password: values.password,
      })

      if (user) {
        navigate('/rooms', { replace: true })
      } else {
        navigate('/login', { replace: true, state: { registered: true } })
      }
    } catch (registerError) {
      setError(registerError instanceof ApiError ? registerError : toApiError(registerError))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <p className="eyebrow">FR-1 · регистрация</p>
        <h1>Регистрация</h1>
        <p className="muted">Новый пользователь получает роль «сотрудник».</p>

        {error ? (
          <Alert tone="error" title="Не удалось зарегистрироваться">
            <p>{error.message}</p>
            {error.serverMessage ? <p className="alert__hint">Ответ сервера: {error.serverMessage}</p> : null}
          </Alert>
        ) : null}

        <form className="form" onSubmit={handleSubmit} noValidate>
          <label className="field">
            <span className="field__label">Имя и фамилия</span>
            <input
              className="field__input"
              type="text"
              autoComplete="name"
              placeholder="Анна Смирнова"
              value={values.fullName}
              onChange={update('fullName')}
            />
          </label>

          <label className="field">
            <span className="field__label">Email</span>
            <input
              className="field__input"
              type="email"
              autoComplete="email"
              placeholder="anna@example.com"
              value={values.email}
              onChange={update('email')}
            />
          </label>

          <label className="field">
            <span className="field__label">Пароль</span>
            <input
              className="field__input"
              type="password"
              autoComplete="new-password"
              placeholder="Не короче 8 символов"
              value={values.password}
              onChange={update('password')}
            />
          </label>

          <button type="submit" className="button" disabled={submitting}>
            {submitting ? 'Создаём аккаунт…' : 'Зарегистрироваться'}
          </button>
        </form>

        <p className="auth-card__footer">
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </p>
      </div>
    </div>
  )
}
