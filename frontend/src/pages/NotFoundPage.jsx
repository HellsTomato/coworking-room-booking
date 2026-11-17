import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <section className="page page--narrow">
      <p className="eyebrow">404</p>
      <h1>Страница не найдена</h1>
      <p className="muted">Проверьте адрес или вернитесь в каталог переговорных комнат.</p>
      <Link className="button" to="/rooms">
        В каталог
      </Link>
    </section>
  )
}
