const STATUS_LABELS = {
  PENDING: 'Ожидает подтверждения',
  CONFIRMED: 'Подтверждена',
  CANCELLED: 'Отменена',
  REJECTED: 'Отклонена',
  COMPLETED: 'Завершена',
}

function statusLabel(status) {
  return STATUS_LABELS[status] || status || 'Неизвестно'
}

export function StatusBadge({ status }) {
  return <span className={`badge badge--${String(status || 'unknown').toLowerCase()}`}>{statusLabel(status)}</span>
}
