export function Loading({ label = 'Загрузка…' }) {
  return (
    <p className="loading" role="status">
      <span className="loading__dot" aria-hidden="true" />
      {label}
    </p>
  )
}
