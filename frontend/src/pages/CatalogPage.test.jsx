import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ApiError, ERROR_MESSAGES } from '../api/errors.js'
import { listRooms } from '../api/rooms.js'
import { renderWithProviders } from '../test/renderWithProviders.jsx'
import { CatalogPage } from './CatalogPage.jsx'

vi.mock('../api/rooms.js', () => ({
  listRooms: vi.fn(),
}))

const ROOMS = [
  { id: 12, name: 'Room 12', capacity: 6, equipment: 'projector, whiteboard' },
  { id: 15, name: 'Room 15', capacity: 10, equipment: 'video' },
]

describe('CatalogPage', () => {
  beforeEach(() => {
    listRooms.mockReset()
  })

  it('загружает и показывает каталог комнат', async () => {
    listRooms.mockResolvedValue(ROOMS)

    renderWithProviders(<CatalogPage />)

    expect(await screen.findByText('Room 12')).toBeInTheDocument()
    expect(screen.getByText('Room 15')).toBeInTheDocument()
    expect(screen.getByText('projector')).toBeInTheDocument()
    expect(screen.getByText('whiteboard')).toBeInTheDocument()
    expect(listRooms).toHaveBeenCalledWith({})
  })

  it('показывает ошибку API и позволяет повторить загрузку', async () => {
    const user = userEvent.setup()
    listRooms
      .mockRejectedValueOnce(
        new ApiError({
          status: 500,
          code: 'SERVER_ERROR',
          message: ERROR_MESSAGES[500],
          serverMessage: 'Internal Server Error',
        }),
      )
      .mockResolvedValueOnce(ROOMS)

    renderWithProviders(<CatalogPage />)

    expect(await screen.findByText('Не удалось загрузить каталог')).toBeInTheDocument()
    expect(screen.getByText(/Internal Server Error/)).toBeInTheDocument()
    expect(screen.queryByText('Room 12')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Повторить' }))

    expect(await screen.findByText('Room 12')).toBeInTheDocument()
    expect(screen.queryByText('Не удалось загрузить каталог')).not.toBeInTheDocument()
  })
})
