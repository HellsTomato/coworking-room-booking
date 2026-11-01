import { Link } from 'react-router';
import StubPage from './StubPage.jsx';

export default function RoomsPage() {
  return (
    <StubPage
      title="Комнаты"
      lab={3}
      endpoints={['GET /api/v1/rooms?capacity=&equipment=&from=&to=']}
    >
      <p>Фильтры: вместимость, оборудование, интервал доступности.</p>
      <p>
        <Link to="/bookings/new">Забронировать комнату</Link>
      </p>
    </StubPage>
  );
}
