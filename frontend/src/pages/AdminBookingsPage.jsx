import StubPage from './StubPage.jsx';

export default function AdminBookingsPage() {
  return (
    <StubPage
      title="Заявки на бронирование"
      lab={4}
      endpoints={[
        'GET /api/v1/admin/bookings?status=PENDING',
        'PATCH /api/v1/admin/bookings/{id}/confirm',
        'PATCH /api/v1/admin/bookings/{id}/reject',
      ]}
    />
  );
}
