import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import App from './App.jsx'
import { listRooms } from './api/rooms.js'
import { renderWithProviders } from './test/renderWithProviders.jsx'

vi.mock('./api/rooms.js', () => ({
  listRooms: vi.fn(),
  getRoom: vi.fn(),
  createRoom: vi.fn(),
  updateRoom: vi.fn(),
  archiveRoom: vi.fn(),
}))

function signInAsEmployee() {
  window.localStorage.setItem(
    'coworking.session',
    JSON.stringify({
      token: 'mock.1',
      user: { userId: 1, email: 'employee@example.com', fullName: 'Анна', role: 'EMPLOYEE' },
    }),
  )
}

describe('Маршрутизация', () => {
  beforeEach(() => {
    listRooms.mockReset()
    listRooms.mockResolvedValue([])
  })

  it('перенаправляет неавторизованного пользователя с защищённого маршрута на вход', async () => {
    renderWithProviders(<App />, { route: '/bookings' })

    expect(await screen.findByRole('heading', { name: 'Вход в систему' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Мои брони' })).not.toBeInTheDocument()
  })

  it('не пускает сотрудника в административный раздел и показывает каталог', async () => {
    signInAsEmployee()

    renderWithProviders(<App />, { route: '/admin/rooms' })

    expect(await screen.findByRole('heading', { name: 'Переговорные комнаты' })).toBeInTheDocument()
    expect(screen.getByText('Недостаточно прав')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Управление комнатами' })).not.toBeInTheDocument()
  })
})
