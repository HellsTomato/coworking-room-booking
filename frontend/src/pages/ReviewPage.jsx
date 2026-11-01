import { Link, useParams } from 'react-router';
import StubPage from './StubPage.jsx';

export default function ReviewPage() {
  const { roomId } = useParams();
  return (
    <StubPage
      title={`Отзыв о комнате #${roomId}`}
      lab={5}
      endpoints={[`POST /api/v1/rooms/${roomId}/reviews`]}
    >
      <p>
        <Link to="/bookings/history">Вернуться к истории</Link>
      </p>
    </StubPage>
  );
}
