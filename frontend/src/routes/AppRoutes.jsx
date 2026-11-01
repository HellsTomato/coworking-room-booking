import { Navigate, Route, Routes } from 'react-router';
import LoginPage from '../pages/LoginPage.jsx';
import RegisterPage from '../pages/RegisterPage.jsx';
import RoomsPage from '../pages/RoomsPage.jsx';
import NewBookingPage from '../pages/NewBookingPage.jsx';
import MyBookingsPage from '../pages/MyBookingsPage.jsx';
import BookingHistoryPage from '../pages/BookingHistoryPage.jsx';
import AdminRoomsPage from '../pages/AdminRoomsPage.jsx';
import AdminBookingsPage from '../pages/AdminBookingsPage.jsx';
import ReviewPage from '../pages/ReviewPage.jsx';
import NotFoundPage from '../pages/NotFoundPage.jsx';

// ponytail: no role guards yet; JWT and EMPLOYEE/ADMIN checks arrive in Lab 2.
export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/rooms" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/rooms" element={<RoomsPage />} />
      <Route path="/rooms/:roomId/review" element={<ReviewPage />} />
      <Route path="/bookings" element={<MyBookingsPage />} />
      <Route path="/bookings/new" element={<NewBookingPage />} />
      <Route path="/bookings/history" element={<BookingHistoryPage />} />
      <Route path="/admin/rooms" element={<AdminRoomsPage />} />
      <Route path="/admin/bookings" element={<AdminBookingsPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
