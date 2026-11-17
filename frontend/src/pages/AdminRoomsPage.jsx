import { useEffect, useState } from 'react'

import { ApiError, toApiError } from '../api/errors.js'
import { archiveRoom, createRoom, listRooms, updateRoom } from '../api/rooms.js'
import { Alert } from '../components/Alert.jsx'
import { Loading } from '../components/Loading.jsx'
import { equipmentList, roomName } from '../utils/rooms.js'

const EMPTY_FORM = { id: null, name: '', capacity: '', equipment: '' }

export function AdminRoomsPage() {
  const [rooms, setRooms] = useState([])
  const [status, setStatus] = useState('loading')
  const [loadError, setLoadError] = useState(null)
  const [reloadToken, setReloadToken] = useState(0)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formError, setFormError] = useState('')
  const [notice, setNotice] = useState('')
  const [actionError, setActionError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [archivingId, setArchivingId] = useState(null)

  useEffect(() => {
    let cancelled = false

    setStatus('loading')
    setLoadError(null)

    listRooms({ includeArchived: true })
      .then((data) => {
        if (cancelled) {
          return
        }
        setRooms(data)
        setStatus('ready')
      })
      .catch((error) => {
        if (cancelled) {
          return
        }
        setLoadError(toApiError(error))
        setStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [reloadToken])

  const update = (field) => (event) => {
    const { value } = event.target
    setForm((previous) => ({ ...previous, [field]: value }))
    setFormError('')
  }

  const reload = () => {
    setReloadToken((token) => token + 1)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const name = form.name.trim()
    const capacity = Number(form.capacity)

    if (!name) {
      setFormError('Укажите название комнаты.')
      return
    }
    if (!Number.isInteger(capacity) || capacity < 1) {
      setFormError('Вместимость должна быть целым числом от 1.')
      return
    }

    setSubmitting(true)
    setFormError('')
    setActionError(null)
    setNotice('')

    const payload = { name, capacity, equipment: form.equipment.trim() }

    try {
      if (form.id) {
        await updateRoom(form.id, payload)
        setNotice(`Комната «${name}» обновлена.`)
      } else {
        await createRoom(payload)
        setNotice(`Комната «${name}» добавлена.`)
      }
      setForm(EMPTY_FORM)
      reload()
    } catch (error) {
      setActionError(error instanceof ApiError ? error : toApiError(error))
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (room) => {
    setForm({
      id: room.id,
      name: room.name || '',
      capacity: String(room.capacity ?? ''),
      equipment: equipmentList(room.equipment).join(', '),
    })
    setFormError('')
    setNotice('')
    setActionError(null)
  }

  const handleArchive = async (room) => {
    setArchivingId(room.id)
    setActionError(null)
    setNotice('')

    try {
      await archiveRoom(room.id)
      setNotice(`Комната «${roomName(room)}» архивирована.`)
      reload()
    } catch (error) {
      setActionError(error instanceof ApiError ? error : toApiError(error))
    } finally {
      setArchivingId(null)
    }
  }

  return (
    <section className="page">
      <header className="page__header">
        <div>
          <p className="eyebrow">FR-7 · администрирование</p>
          <h1>Управление комнатами</h1>
          <p className="muted">Добавляйте комнаты, меняйте параметры и архивируйте устаревшие.</p>
        </div>
      </header>

      {notice ? (
        <Alert tone="success" title="Готово">
          <p>{notice}</p>
        </Alert>
      ) : null}

      {actionError ? (
        <Alert tone="error" title="Не удалось выполнить действие">
          <p>{actionError.message}</p>
          {actionError.serverMessage ? (
            <p className="alert__hint">Ответ сервера: {actionError.serverMessage}</p>
          ) : null}
        </Alert>
      ) : null}

      <div className="admin-grid">
        <form className="card form" onSubmit={handleSubmit} noValidate aria-label="Форма комнаты">
          <h2>{form.id ? `Редактирование комнаты #${form.id}` : 'Новая комната'}</h2>

          <label className="field">
            <span className="field__label">Название</span>
            <input
              className="field__input"
              type="text"
              maxLength="100"
              placeholder="Например, Альфа"
              value={form.name}
              onChange={update('name')}
            />
          </label>

          <label className="field">
            <span className="field__label">Вместимость, чел.</span>
            <input
              className="field__input"
              type="number"
              min="1"
              step="1"
              placeholder="6"
              value={form.capacity}
              onChange={update('capacity')}
            />
          </label>

          <label className="field">
            <span className="field__label">Оборудование</span>
            <input
              className="field__input"
              type="text"
              placeholder="projector, whiteboard"
              value={form.equipment}
              onChange={update('equipment')}
            />
          </label>

          {formError ? (
            <p className="field__error" role="alert">
              {formError}
            </p>
          ) : null}

          <div className="form__actions">
            <button type="submit" className="button" disabled={submitting}>
              {submitting ? 'Сохраняем…' : form.id ? 'Сохранить изменения' : 'Добавить комнату'}
            </button>
            {form.id ? (
              <button
                type="button"
                className="button button--ghost"
                onClick={() => setForm(EMPTY_FORM)}
              >
                Отменить редактирование
              </button>
            ) : null}
          </div>
        </form>

        <div className="admin-list">
          <h2>Комнаты</h2>

          {status === 'loading' ? <Loading label="Загружаем комнаты…" /> : null}

          {status === 'error' ? (
            <Alert
              tone="error"
              title="Не удалось загрузить комнаты"
              action={
                <button type="button" className="button" onClick={reload}>
                  Повторить
                </button>
              }
            >
              <p>{loadError?.message}</p>
            </Alert>
          ) : null}

          {status === 'ready' && rooms.length === 0 ? (
            <p className="muted">Комнат пока нет — добавьте первую через форму слева.</p>
          ) : null}

          {status === 'ready' && rooms.length > 0 ? (
            <ul className="admin-rooms">
              {rooms.map((room) => (
                <li className="admin-room" key={room.id}>
                  <div>
                    <p className="admin-room__name">
                      {roomName(room)}{' '}
                      {room.archived ? <span className="badge badge--archived">В архиве</span> : null}
                    </p>
                    <p className="muted">
                      {room.capacity} чел. · {equipmentList(room.equipment).join(', ') || 'оборудование не указано'}
                    </p>
                  </div>
                  <div className="admin-room__actions">
                    <button
                      type="button"
                      className="button button--ghost"
                      onClick={() => handleEdit(room)}
                    >
                      Изменить
                    </button>
                    {!room.archived ? (
                      <button
                        type="button"
                        className="button button--danger"
                        onClick={() => handleArchive(room)}
                        disabled={archivingId === room.id}
                      >
                        {archivingId === room.id ? 'Архивируем…' : 'Архивировать'}
                      </button>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </section>
  )
}
