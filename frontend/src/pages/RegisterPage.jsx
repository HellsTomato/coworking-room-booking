import { Link } from 'react-router';
import StubPage from './StubPage.jsx';

export default function RegisterPage() {
  return (
    <StubPage title="Регистрация" lab={2} endpoints={['POST /api/v1/auth/register']}>
      <p>
        Уже есть аккаунт? <Link to="/login">Войти</Link>
      </p>
    </StubPage>
  );
}
