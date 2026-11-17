import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

import { toApiError } from '../api/errors.js'
import { listRooms } from '../api/rooms.js'
import { Alert } from '../components/Alert.jsx'
import { EmptyState } from '../components/EmptyState.jsx'
import { Loading } from '../components/Loading.jsx'
import { RoomCard } from '../components/RoomCard.jsx'
import { RoomFilters } from '../components/RoomFilters.jsx'
import { toOffsetDateTime } from '../utils/datetime.js'

function toQuery(values) {
  const query = {}
  if (values.capacity !== '') {
    query.capacity = Number(values.capacity)
  }
  if (values.equipment) {
    query.equipment = values.equipment
  }
  if (values.date && values.timeFrom && values.timeTo) {
    query.from = toOffsetDateTime(values.date, values.timeFrom)
    query.to = toOffsetDateTime(values.date, values.timeTo)
  }
  return query
}

export function CatalogPage() {
  const location = useLocation()
  const [query, setQuery] = useState({})
  const [rooms, setRooms] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState(null)
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    let cancelled = false

    setStatus('loading')
    setError(null)

    listRooms(query)
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
  }, [query, reloadToken])

  const handleSearch = (values) => {
    setQuery(toQuery(values))
  }

  const handleReset = () => {
    setQuery({})
  }

  const retry = () => {
    setReloadToken((token) => token + 1)
  }

  return (
    <section className="page">
      <header className="page__header">
        <div>
          <p className="eyebrow">FR-5 · каталог комнат</p>
          <h1>Переговорные комнаты</h1>
          <p className="muted">
            Отфильтруйте комнаты по вместимости, оборудованию и свободному интервалу.
          </p>
        </div>
        <span className="counter" aria-live="polite">
          Найдено: {status === 'ready' ? rooms.length : '…'}
        </span>
      </header>

      {location.state?.denied ? (
        <Alert tone="warning" title="Недостаточно прав">
          <p>Раздел администратора доступен только пользователям с ролью ADMIN.</p>
        </Alert>
      ) : null}

      <RoomFilters onSearch={handleSearch} onReset={handleReset} />

      {status === 'loading' ? <Loading label="Загружаем каталог…" /> : null}

      {status === 'error' ? (
        <Alert
          tone="error"
          title="Не удалось загрузить каталог"
          action={
            <button type="button" className="button" onClick={retry}>
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
          title="Подходящих комнат нет"
          description={`Фильтры: ${query.capacity ? `вместимость от ${query.capacity}; ` : ''}${
            query.equipment ? `оборудование «${query.equipment}»; ` : ''
          }${query.from ? 'указанный интервал. ' : ''}Попробуйте изменить условия поиска.`}
          action={
            <button type="button" className="button button--ghost" onClick={handleReset}>
              Сбросить фильтры
            </button>
          }
        />
      ) : null}

      {status === 'ready' && rooms.length > 0 ? (
        <div className="room-grid">
          {rooms.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
      ) : null}
    </section>
  )
}
