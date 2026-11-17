import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { cancelBooking, listMyBookings } from '../api/bookings.js'
import { ApiError, toApiError } from '../api/errors.js'
import { createReview } from '../api/reviews.js'
import { listRooms } from '../api/rooms.js'
import { useAuth } from '../auth/useAuth.js'
import { Alert } from '../components/Alert.jsx'
import { EmptyState } from '../components/EmptyState.jsx'
import { Loading } from '../components/Loading.jsx'
import { StatusBadge } from '../components/StatusBadge.jsx'
import { formatDate, formatTimeRange } from '../utils/datetime.js'
import { bookingRoomName } from '../utils/rooms.js'

const SCOPES = [
  { value: 'active', label: 'Активные' },
  { value: 'history', label: 'История' },
]

function canReview(booking, reviewedIds) {
  return (
    booking?.status === 'COMPLETED' &&
    Boolean(booking.bookingId) &&
    !reviewedIds.includes(booking.bookingId) &&
    booking.reviewed !== true
  )
}

export function MyBookingsPage() {
  const { user } = useAuth()
  const [scope, setScope] = useState('active')
  const [bookings, setBookings] = useState([])
  const [roomsById, setRoomsById] = useState({})
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState(null)
  const [reloadToken, setReloadToken] = useState(0)
  const [pendingCancelId, setPendingCancelId] = useState(null)
  const [notice, setNotice] = useState('')
  const [actionError, setActionError] = useState(null)
  const [reviewFor, setReviewFor] = useState(null)
  const [reviewRating, setReviewRating] = useState('5')
  const [reviewComment, setReviewComment] = useState('')
  const [reviewSubmitting, setReviewSubmitting] = useState(false)
  const [reviewedIds, setReviewedIds] = useState([])

  useEffect(() => {
    let cancelled = false

    setStatus('loading')
    setError(null)
    setActionError(null)

    const load = async () => {
      const [bookingsResult, roomsResult] = await Promise.allSettled([listMyBookings(scope), listRooms()])
      if (cancelled) {
        return
      }

      if (bookingsResult.status === 'rejected') {
        setError(toApiError(bookingsResult.reason))
        setStatus('error')
        return
      }

      setBookings(bookingsResult.value)
      if (roomsResult.status === 'fulfilled') {
        setRoomsById(Object.fromEntries(roomsResult.value.map((room) => [room.id, room])))
      }
      setStatus('ready')
    }

    load()

    return () => {
      cancelled = true
    }
  }, [scope, reloadToken])

  const handleCancel = async (booking) => {
    setPendingCancelId(booking.bookingId)
    setActionError(null)
    setNotice('')

    try {
      await cancelBooking(booking.bookingId)
      setNotice(`Бронь №${booking.bookingId} отменена.`)
      setReloadToken((token) => token + 1)
    } catch (cancelError) {
      setActionError(cancelError instanceof ApiError ? cancelError : toApiError(cancelError))
    } finally {
      setPendingCancelId(null)
    }
  }

  const openReview = (booking) => {
    setReviewFor(booking)
    setReviewRating('5')
    setReviewComment('')
    setActionError(null)
    setNotice('')
  }

  const handleReviewSubmit = async (event) => {
    event.preventDefault()
    if (!reviewFor) {
      return
    }

    const rating = Number(reviewRating)
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      setActionError(
        new ApiError({
          status: 400,
          code: 'VALIDATION_ERROR',
          message: 'Оценка должна быть целым числом от 1 до 5.',
        }),
      )
      return
    }

    setReviewSubmitting(true)
    setActionError(null)

    try {
      await createReview(reviewFor.roomId, {
        bookingId: reviewFor.bookingId,
        rating,
        comment: reviewComment.trim(),
      })
      setReviewedIds((ids) => [...ids, reviewFor.bookingId])
      setNotice('Спасибо! Отзыв сохранён.')
      setReviewFor(null)
    } catch (reviewError) {
      setActionError(reviewError instanceof ApiError ? reviewError : toApiError(reviewError))
    } finally {
      setReviewSubmitting(false)
    }
  }

  return (
    <section className="page">
      <header className="page__header">
        <div>
          <p className="eyebrow">FR-6 · мои брони</p>
          <h1>Мои брони</h1>
          <p className="muted">
            {user?.fullName ? `${user.fullName}, здесь` : 'Здесь'} собраны ваши активные заявки и история.
          </p>
        </div>
        <Link className="button" to="/bookings/new">
          Новая бронь
        </Link>
      </header>

      <div className="tabs" role="tablist" aria-label="Фильтр броней">
        {SCOPES.map((item) => (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={scope === item.value}
            className={scope === item.value ? 'tab tab--active' : 'tab'}
            onClick={() => setScope(item.value)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {notice ? (
        <Alert tone="success" title="Готово">
          <p>{notice}</p>
        </Alert>
      ) : null}

      {actionError ? (
        <Alert tone="error" title="Действие не выполнено">
          <p>{actionError.message}</p>
          {actionError.serverMessage ? (
            <p className="alert__hint">Ответ сервера: {actionError.serverMessage}</p>
          ) : null}
        </Alert>
      ) : null}

      {status === 'loading' ? <Loading label="Загружаем ваши брони…" /> : null}

      {status === 'error' ? (
        <Alert
          tone="error"
          title="Не удалось загрузить брони"
          action={
            <button
              type="button"
              className="button"
              onClick={() => setReloadToken((token) => token + 1)}
            >
              Повторить
            </button>
          }
        >
          <p>{error?.message}</p>
          {error?.serverMessage ? <p className="alert__hint">Ответ сервера: {error.serverMessage}</p> : null}
        </Alert>
      ) : null}

      {status === 'ready' && bookings.length === 0 ? (
        <EmptyState
          title={scope === 'active' ? 'Активных броней нет' : 'История пуста'}
          description={
            scope === 'active'
              ? 'Выберите комнату в каталоге и создайте первую бронь.'
              : 'Завершённые и отменённые брони появятся здесь.'
          }
          action={
            <Link className="button" to="/rooms">
              Перейти в каталог
            </Link>
          }
        />
      ) : null}

      {status === 'ready' && bookings.length > 0 ? (
        <ul className="booking-list">
          {bookings.map((booking) => (
            <li
              className="booking-card"
              key={booking.bookingId ?? `${booking.roomId}-${booking.date}-${booking.timeFrom}`}
            >
              <div className="booking-card__body">
                <div className="booking-card__header">
                  <h3>{bookingRoomName(booking, roomsById)}</h3>
                  <StatusBadge status={booking.status} />
                </div>
                <p className="booking-card__meta">
                  {formatDate(booking.date)} · {formatTimeRange(booking.timeFrom, booking.timeTo)}
                </p>
                <p className="muted">Заявка №{booking.bookingId ?? '—'}</p>
              </div>

              <div className="booking-card__actions">
                {scope === 'active' && ['PENDING', 'CONFIRMED'].includes(booking.status) ? (
                  <button
                    type="button"
                    className="button button--ghost"
                    onClick={() => handleCancel(booking)}
                    disabled={pendingCancelId === booking.bookingId}
                  >
                    {pendingCancelId === booking.bookingId ? 'Отменяем…' : 'Отменить'}
                  </button>
                ) : null}

                {canReview(booking, reviewedIds) ? (
                  <button type="button" className="button" onClick={() => openReview(booking)}>
                    Оставить отзыв
                  </button>
                ) : null}

                {booking.status === 'COMPLETED' && !canReview(booking, reviewedIds) ? (
                  <span className="muted">Отзыв оставлен</span>
                ) : null}
              </div>

              {reviewFor?.bookingId === booking.bookingId ? (
                <form className="review-form" onSubmit={handleReviewSubmit}>
                  <label className="field">
                    <span className="field__label">Оценка</span>
                    <select
                      className="field__input"
                      value={reviewRating}
                      onChange={(event) => setReviewRating(event.target.value)}
                    >
                      {[5, 4, 3, 2, 1].map((value) => (
                        <option key={value} value={value}>
                          {value} из 5
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="field">
                    <span className="field__label">Комментарий</span>
                    <textarea
                      className="field__input"
                      rows="3"
                      maxLength="500"
                      placeholder="Что понравилось или что стоит улучшить"
                      value={reviewComment}
                      onChange={(event) => setReviewComment(event.target.value)}
                    />
                  </label>

                  <div className="form__actions">
                    <button type="submit" className="button" disabled={reviewSubmitting}>
                      {reviewSubmitting ? 'Сохраняем…' : 'Сохранить отзыв'}
                    </button>
                    <button
                      type="button"
                      className="button button--ghost"
                      onClick={() => setReviewFor(null)}
                    >
                      Отмена
                    </button>
                  </div>
                </form>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}
