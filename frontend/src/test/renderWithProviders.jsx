import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { AuthProvider } from '../auth/AuthProvider.jsx'

export function renderWithProviders(ui, { route = '/' } = {}) {
  return render(
    <MemoryRouter
      initialEntries={[route]}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <AuthProvider>{ui}</AuthProvider>
    </MemoryRouter>,
  )
}
