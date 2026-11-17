import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { toApiError } from '../api/errors.js'
import { listReviews } from '../api/reviews.js'
import { getRoom } from '../api/rooms.js'
import { Alert } from '../components/Alert.jsx'
import { Loading } from '../components/Loading.jsx'
import { ReviewList } from '../components/ReviewList.jsx'
import { equipmentList, roomName } from '../utils/rooms.js'

export function RoomPage() {
  const { roomId } = useParams()
  const [room, setRoom] = useState(null)
  const [reviews, setReviews] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    setStatus('loading')
    setError(null)
    setReviews([])

    const load = async () => {
      try {
        const roomData = await getRoom(roomId)
        if (cancelled) {
          return
        }
        setRoom(roomData)

        try {
          const reviewData = await listReviews(roomId)
          if (!cancelled) {
            setReviews(reviewData)
          }
        } catch {
          if (!cancelled) {
            setReviews([])
          }
        }

        if (!cancelled) {
          setStatus('ready')
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(toApiError(loadError))
          setStatus('error')
        }
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [roomId])

  if (status === 'loading') {
    return <Loading label="Загружаем комнату…" />
  }

  if (status === 'error') {
    return (
      <section className="page">
        <Alert tone="error" title="Не удалось загрузить комнату">
          <p>{error?.message}</p>
          {error?.serverMessage ? <p className="alert__hint">Ответ сервера: {error.serverMessage}</p> : null}
        </Alert>
        <p>
          <Link to="/rooms">Вернуться в каталог</Link>
        </p>
      </section>
    )
  }

  const equipment = equipmentList(room?.equipment)

  return (
    <section className="page">
      <p className="eyebrow">FR-5 · карточка комнаты</p>
      <header className="page__header page__header--room">
        <div>
          <h1>{roomName(room)}</h1>
          <p className="muted">Вместимость: {room?.capacity} человек</p>
          {equipment.length > 0 ? (
            <ul className="chips" aria-label="Оборудование">
              {equipment.map((item) => (
                <li className="chip" key={item}>
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">Оборудование не указано</p>
          )}
        </div>
        <div className="page__actions">
          <Link className="button" to={`/bookings/new?roomId=${room?.id}`}>
            Забронировать
          </Link>
          <Link className="button button--ghost" to="/rooms">
            В каталог
          </Link>
        </div>
      </header>

      <section className="section">
        <h2>Отзывы</h2>
        <p className="muted">
          Оставить отзыв можно в разделе <Link to="/bookings">«Мои брони»</Link> после завершения
          подтверждённой брони.
        </p>
        <ReviewList reviews={reviews} />
      </section>
    </section>
  )
}
