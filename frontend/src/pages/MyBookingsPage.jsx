import { Link } from 'react-router';
import StubPage from './StubPage.jsx';

export default function MyBookingsPage() {
  return (
    <StubPage
      title="Мои активные брони"
      lab={3}
      endpoints={['GET /api/v1/bookings/me?scope=active', 'PATCH /api/v1/bookings/{id}/cancel']}
    >
      <p>
        Статусы: <code>PENDING</code>, <code>CONFIRMED</code>. Завершённые и отменённые — в{' '}
        <Link to="/bookings/history">истории</Link>.
      </p>
    </StubPage>
  );
}
