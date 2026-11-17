import { useState } from 'react'

import { todayIso } from '../utils/datetime.js'

const EMPTY_FILTERS = {
  capacity: '',
  equipment: '',
  date: '',
  timeFrom: '',
  timeTo: '',
}

const EQUIPMENT_OPTIONS = [
  { value: '', label: 'Любое оборудование' },
  { value: 'projector', label: 'Проектор (projector)' },
  { value: 'whiteboard', label: 'Доска (whiteboard)' },
  { value: 'video', label: 'Видеосвязь (video)' },
  { value: 'speakerphone', label: 'Спикерфон (speakerphone)' },
]

function validateFilters(values) {
  if (values.capacity !== '') {
    const capacity = Number(values.capacity)
    if (!Number.isInteger(capacity) || capacity < 1) {
      return 'Вместимость должна быть целым положительным числом.'
    }
  }

  if (values.date) {
    if (!values.timeFrom || !values.timeTo) {
      return 'Если указана дата, укажите и время начала, и время окончания.'
    }
    if (values.date < todayIso()) {
      return 'Дата не может быть в прошлом.'
    }
    if (values.timeFrom >= values.timeTo) {
      return 'Время окончания должно быть позже времени начала.'
    }
  }

  return ''
}

export function RoomFilters({ onSearch, onReset }) {
  const [values, setValues] = useState(EMPTY_FILTERS)
  const [error, setError] = useState('')

  const update = (field) => (event) => {
    const { value } = event.target
    setValues((previous) => ({ ...previous, [field]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const message = validateFilters(values)
    if (message) {
      setError(message)
      return
    }
    setError('')
    onSearch(values)
  }

  const handleReset = () => {
    setValues(EMPTY_FILTERS)
    setError('')
    onReset()
  }

  return (
    <form className="filters" onSubmit={handleSubmit} noValidate aria-label="Фильтры каталога">
      <div className="filters__grid">
        <label className="field">
          <span className="field__label">Вместимость, чел.</span>
          <input
            className="field__input"
            type="number"
            min="1"
            step="1"
            placeholder="Например, 6"
            value={values.capacity}
            onChange={update('capacity')}
          />
        </label>

        <label className="field">
          <span className="field__label">Оборудование</span>
          <select className="field__input" value={values.equipment} onChange={update('equipment')}>
            {EQUIPMENT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span className="field__label">Дата</span>
          <input
            className="field__input"
            type="date"
            min={todayIso()}
            value={values.date}
            onChange={update('date')}
          />
        </label>

        <label className="field">
          <span className="field__label">С</span>
          <input className="field__input" type="time" value={values.timeFrom} onChange={update('timeFrom')} />
        </label>

        <label className="field">
          <span className="field__label">По</span>
          <input className="field__input" type="time" value={values.timeTo} onChange={update('timeTo')} />
        </label>
      </div>

      {error ? (
        <p className="field__error" role="alert">
          {error}
        </p>
      ) : null}

      <div className="filters__actions">
        <button type="button" className="button button--ghost" onClick={handleReset}>
          Сбросить
        </button>
        <button type="submit" className="button">
          Искать
        </button>
      </div>
    </form>
  )
}
