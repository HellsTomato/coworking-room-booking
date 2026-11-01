import { Link } from 'react-router';
import StubPage from './StubPage.jsx';

export default function BookingHistoryPage() {
  return (
    <StubPage
      title="История бронирований"
      lab={4}
      endpoints={['GET /api/v1/bookings/me?scope=history']}
    >
      <p>
        Для брони в статусе <code>COMPLETED</code> доступна кнопка отзыва, например:{' '}
        <Link to="/rooms/1/review">отзыв о комнате #1</Link>.
      </p>
    </StubPage>
  );
}
