import { Navigate, Route, Routes } from 'react-router-dom'

import { RequireAdmin, RequireAuth } from './auth/RequireAuth.jsx'
import { Layout } from './components/Layout.jsx'
import { AdminRoomsPage } from './pages/AdminRoomsPage.jsx'
import { BookingPage } from './pages/BookingPage.jsx'
import { CatalogPage } from './pages/CatalogPage.jsx'
import { LoginPage } from './pages/LoginPage.jsx'
import { MyBookingsPage } from './pages/MyBookingsPage.jsx'
import { NotFoundPage } from './pages/NotFoundPage.jsx'
import { RegisterPage } from './pages/RegisterPage.jsx'
import { RoomPage } from './pages/RoomPage.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<Layout />}>
        <Route index element={<Navigate to="/rooms" replace />} />
        <Route path="rooms" element={<CatalogPage />} />
        <Route path="rooms/:roomId" element={<RoomPage />} />

        <Route element={<RequireAuth />}>
          <Route path="bookings" element={<MyBookingsPage />} />
          <Route path="bookings/new" element={<BookingPage />} />
        </Route>

        <Route element={<RequireAdmin />}>
          <Route path="admin/rooms" element={<AdminRoomsPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
