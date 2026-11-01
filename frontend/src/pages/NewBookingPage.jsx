import { Link } from 'react-router';
import StubPage from './StubPage.jsx';

export default function NewBookingPage() {
  return (
    <StubPage title="Новое бронирование" lab={3} endpoints={['POST /api/v1/bookings']}>
      <p>
        После отправки заявка получает статус <code>PENDING</code> и появляется в разделе{' '}
        <Link to="/bookings">Мои брони</Link>.
      </p>
    </StubPage>
  );
}
