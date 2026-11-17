import { EmptyState } from './EmptyState.jsx'

function formatReviewDate(value) {
  if (!value) {
    return ''
  }
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? String(value) : parsed.toLocaleDateString('ru-RU')
}

export function ReviewList({ reviews = [] }) {
  if (reviews.length === 0) {
    return (
      <EmptyState
        title="Отзывов пока нет"
        description="Отзыв можно оставить после завершённой подтверждённой брони в разделе «Мои брони»."
      />
    )
  }

  const average = reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviews.length

  return (
    <section className="reviews" aria-label="Отзывы о комнате">
      <p className="reviews__summary">
        Средняя оценка: <strong>{average.toFixed(1)}</strong> из 5 · отзывов: {reviews.length}
      </p>
      <ul className="reviews__list">
        {reviews.map((review) => (
          <li className="review" key={review.reviewId ?? `${review.authorName}-${review.createdAt}`}>
            <div className="review__header">
              <span className="review__author">{review.authorName || review.author || 'Сотрудник'}</span>
              <span className="review__rating" aria-label={`Оценка ${review.rating} из 5`}>
                {'★'.repeat(Number(review.rating) || 0)}
                {'☆'.repeat(Math.max(0, 5 - (Number(review.rating) || 0)))}
              </span>
            </div>
            {review.comment ? <p className="review__comment">{review.comment}</p> : null}
            {review.createdAt ? <p className="review__date">{formatReviewDate(review.createdAt)}</p> : null}
          </li>
        ))}
      </ul>
    </section>
  )
}
