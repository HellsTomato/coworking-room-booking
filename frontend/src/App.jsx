import { NavLink } from 'react-router';
import AppRoutes from './routes/AppRoutes.jsx';

const navLinks = [
  { to: '/rooms', label: 'Комнаты' },
  { to: '/bookings/new', label: 'Забронировать' },
  { to: '/bookings', label: 'Мои брони', end: true },
  { to: '/bookings/history', label: 'История' },
  { to: '/admin/rooms', label: 'Админ: комнаты' },
  { to: '/admin/bookings', label: 'Админ: заявки' },
  { to: '/login', label: 'Вход' },
  { to: '/register', label: 'Регистрация' },
];

export default function App() {
  return (
    <>
      <header>
        <nav aria-label="Основная навигация">
          {navLinks.map(({ to, label, end }) => (
            <NavLink key={to} to={to} end={end}>
              {label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main>
        <AppRoutes />
      </main>
    </>
  );
}
