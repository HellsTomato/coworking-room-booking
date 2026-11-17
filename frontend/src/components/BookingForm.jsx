import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { createBooking } from '../api/bookings.js'
import { ApiError, toApiError } from '../api/errors.js'
import { todayIso, toOffsetTime } from '../utils/datetime.js'
import { roomName } from '../utils/rooms.js'
import { Alert } from './Alert.jsx'

const CONFLICT_HINT =
  'Данные формы сохранены — измените время или комнату и отправьте снова.'

function validate(values) {
  const errors = {}

  if (!values.roomId) {
    errors.roomId = 'Выберите комнату.'
  }
  if (!values.date) {
    errors.date = 'Укажите дату.'
  } else if (values.date < todayIso()) {
    errors.date = 'Дата не может быть в прошлом.'
  }
  if (!values.timeFrom) {
    errors.timeFrom = 'Укажите время начала.'
  }
  if (!values.timeTo) {
    errors.timeTo = 'Укажите время окончания.'
  }
  if (values.timeFrom && values.timeTo && values.timeFrom >= values.timeTo) {
    errors.timeTo = 'Время окончания должно быть позже времени начала.'
  }

  return errors
}

export function BookingForm({ rooms = [], initialRoomId = '' }) {
  const [values, setValues] = useState({
    roomId: initialRoomId ? String(initialRoomId) : '',
    date: '',
    timeFrom: '',
    timeTo: '',
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [created, setCreated] = useState(null)
  const [apiError, setApiError] = useState(null)
  const [conflict, setConflict] = useState(null)

  const selectedRoom = useMemo(
    () => rooms.find((room) => String(room.id) === String(values.roomId)),
    [rooms, values.roomId],
  )

  const update = (field) => (event) => {
    const { value } = event.target
    setValues((previous) => ({ ...previous, [field]: value }))
    setErrors((previous) => ({ ...previous, [field]: undefined }))
    setCreated(null)
    setApiError(null)
    setConflict(null)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const nextErrors = validate(values)
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      setCreated(null)
      setApiError(null)
      setConflict(null)
      return
    }

    setSubmitting(true)
    setErrors({})
    setCreated(null)
    setApiError(null)
    setConflict(null)

    const payload = {
      roomId: Number(values.roomId),
      date: values.date,
      timeFrom: toOffsetTime(values.date, values.timeFrom),
      timeTo: toOffsetTime(values.date, values.timeTo),
    }

    try {
      const booking = await createBooking(payload)
      setCreated(booking)
    } catch (error) {
      const normalized = error instanceof ApiError ? error : toApiError(error)
      if (normalized.status === 409) {
        setConflict(normalized)
      } else {
        setApiError(normalized)
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="form form--booking" onSubmit={handleSubmit} noValidate aria-label="Форма создания брони">
      {created ? (
        <Alert tone="success" title="Бронь создана">
          <p>
            Бронь №{created.bookingId} создана. Статус: <strong>{created.status}</strong>.
          </p>
          <p>
            <Link to="/bookings">Перейти к моим броням</Link>
          </p>
        </Alert>
      ) : null}

      {conflict ? (
        <Alert tone="error" title="Выбранное время уже занято">
          <p>{conflict.message}</p>
          <p>{CONFLICT_HINT}</p>
          {conflict.serverMessage ? <p className="alert__hint">Ответ сервера: {conflict.serverMessage}</p> : null}
        </Alert>
      ) : null}

      {apiError ? (
        <Alert tone="error" title="Не удалось создать бронь">
          <p>{apiError.message}</p>
          {apiError.serverMessage ? <p className="alert__hint">Ответ сервера: {apiError.serverMessage}</p> : null}
          {apiError.status === 401 ? (
            <p>
              <Link to="/login">Войти снова</Link>
            </p>
          ) : null}
        </Alert>
      ) : null}

      <div className="form__grid">
        <label className="field">
          <span className="field__label">Комната</span>
          <select
            className="field__input"
            value={values.roomId}
            onChange={update('roomId')}
            aria-invalid={Boolean(errors.roomId)}
          >
            <option value="">Выберите комнату</option>
            {rooms.map((room) => (
              <option key={room.id} value={room.id}>
                {roomName(room)} · {room.capacity} чел.
              </option>
            ))}
          </select>
          {errors.roomId ? (
            <span className="field__error" role="alert">
              {errors.roomId}
            </span>
          ) : null}
        </label>

        <label className="field">
          <span className="field__label">Дата</span>
          <input
            className="field__input"
            type="date"
            min={todayIso()}
            value={values.date}
            onChange={update('date')}
            aria-invalid={Boolean(errors.date)}
          />
          {errors.date ? (
            <span className="field__error" role="alert">
              {errors.date}
            </span>
          ) : null}
        </label>

        <label className="field">
          <span className="field__label">Начало</span>
          <input
            className="field__input"
            type="time"
            value={values.timeFrom}
            onChange={update('timeFrom')}
            aria-invalid={Boolean(errors.timeFrom)}
          />
          {errors.timeFrom ? (
            <span className="field__error" role="alert">
              {errors.timeFrom}
            </span>
          ) : null}
        </label>

        <label className="field">
          <span className="field__label">Окончание</span>
          <input
            className="field__input"
            type="time"
            value={values.timeTo}
            onChange={update('timeTo')}
            aria-invalid={Boolean(errors.timeTo)}
          />
          {errors.timeTo ? (
            <span className="field__error" role="alert">
              {errors.timeTo}
            </span>
          ) : null}
        </label>
      </div>

      {selectedRoom ? (
        <p className="muted">
          Выбрана комната «{roomName(selectedRoom)}» на {selectedRoom.capacity} человек.
        </p>
      ) : null}

      <div className="form__actions">
        <button type="submit" className="button" disabled={submitting}>
          {submitting ? 'Отправляем…' : 'Создать бронь'}
        </button>
        <span className="muted">Время передаётся с часовым поясом браузера.</span>
      </div>
    </form>
  )
}
