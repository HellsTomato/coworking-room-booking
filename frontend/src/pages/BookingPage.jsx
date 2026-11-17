import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { toApiError } from '../api/errors.js'
import { listRooms } from '../api/rooms.js'
import { Alert } from '../components/Alert.jsx'
import { BookingForm } from '../components/BookingForm.jsx'
import { EmptyState } from '../components/EmptyState.jsx'
import { Loading } from '../components/Loading.jsx'

export function BookingPage() {
  const [searchParams] = useSearchParams()
  const initialRoomId = searchParams.get('roomId') || ''
  const [rooms, setRooms] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState(null)
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    let cancelled = false

    setStatus('loading')
    setError(null)

    listRooms()
      .then((data) => {
        if (cancelled) {
          return
        }
        setRooms(data)
        setStatus('ready')
      })
      .catch((loadError) => {
        if (cancelled) {
          return
        }
        setError(toApiError(loadError))
        setStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [reloadToken])

  return (
    <section className="page page--narrow">
      <p className="eyebrow">FR-3 · создание брони</p>
      <h1>Новая бронь</h1>
      <p className="muted">
        Выберите комнату, дату и интервал. Сервер проверит пересечение с активными бронями и
        вернёт ошибку 409, если слот уже занят.
      </p>

      {status === 'loading' ? <Loading label="Загружаем список комнат…" /> : null}

      {status === 'error' ? (
        <Alert
          tone="error"
          title="Не удалось загрузить комнаты"
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

      {status === 'ready' && rooms.length === 0 ? (
        <EmptyState
          title="Нет доступных комнат"
          description="Когда администратор добавит комнаты, они появятся в этом списке."
        />
      ) : null}

      {status === 'ready' && rooms.length > 0 ? (
        <BookingForm rooms={rooms} initialRoomId={initialRoomId} />
      ) : null}
    </section>
  )
}
