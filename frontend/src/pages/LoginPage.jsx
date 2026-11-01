import { Link } from 'react-router';
import StubPage from './StubPage.jsx';

export default function LoginPage() {
  return (
    <StubPage title="Вход" lab={2} endpoints={['POST /api/v1/auth/login']}>
      <p>
        Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
      </p>
    </StubPage>
  );
}
