import StubPage from './StubPage.jsx';

export default function AdminRoomsPage() {
  return (
    <StubPage
      title="Управление комнатами"
      lab={4}
      endpoints={[
        'POST /api/v1/admin/rooms',
        'PUT /api/v1/admin/rooms/{id}',
        'PATCH /api/v1/admin/rooms/{id}/archive',
      ]}
    />
  );
}
