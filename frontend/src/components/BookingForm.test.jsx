import { fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createBooking } from '../api/bookings.js'
import { ApiError, ERROR_MESSAGES } from '../api/errors.js'
import { renderWithProviders } from '../test/renderWithProviders.jsx'
import { BookingForm } from './BookingForm.jsx'

vi.mock('../api/bookings.js', () => ({
  createBooking: vi.fn(),
}))

const ROOMS = [
  { id: 12, name: 'Room 12', capacity: 6, equipment: 'projector' },
  { id: 15, name: 'Room 15', capacity: 10, equipment: 'whiteboard' },
]

async function fillForm({ date = '2026-12-10', from = '10:00', to = '12:00', roomId = '12' } = {}) {
  const user = userEvent.setup()
  await user.selectOptions(screen.getByLabelText('Комната'), roomId)
  fireEvent.change(screen.getByLabelText('Дата'), { target: { value: date } })
  fireEvent.change(screen.getByLabelText('Начало'), { target: { value: from } })
  fireEvent.change(screen.getByLabelText('Окончание'), { target: { value: to } })
  await user.click(screen.getByRole('button', { name: 'Создать бронь' }))
  return user
}

describe('BookingForm', () => {
  beforeEach(() => {
    createBooking.mockReset()
  })

  it('создаёт бронь и показывает номер со статусом PENDING', async () => {
    createBooking.mockResolvedValue({ bookingId: 42, roomId: 12, status: 'PENDING' })

    renderWithProviders(<BookingForm rooms={ROOMS} />)
    await fillForm()

    await waitFor(() => expect(createBooking).toHaveBeenCalledTimes(2))
    expect(createBooking).toHaveBeenCalledWith({
      roomId: 12,
      date: '2026-12-10',
      timeFrom: expect.stringMatching(/^10:00:00[+-]\d{2}:\d{2}$/),
      timeTo: expect.stringMatching(/^12:00:00[+-]\d{2}:\d{2}$/),
    })

    expect(await screen.findByText(/Бронь №42 создана/)).toBeInTheDocument()
    expect(screen.getByText('PENDING')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Создать бронь' })).toBeEnabled()
  })

  it('показывает понятное сообщение при конфликте 409 и сохраняет данные формы', async () => {
    createBooking.mockRejectedValue(
      new ApiError({
        status: 409,
        code: 'BOOKING_TIME_CONFLICT',
        message: ERROR_MESSAGES[409],
        serverMessage: 'Room 12 is already booked for the requested time slot',
      }),
    )

    renderWithProviders(<BookingForm rooms={ROOMS} />)
    await fillForm()

    expect(await screen.findByText('Выбранное время уже занято')).toBeInTheDocument()
    expect(screen.getByText(/Данные формы сохранены/)).toBeInTheDocument()
    expect(screen.getByText(/Room 12 is already booked/)).toBeInTheDocument()
    expect(screen.queryByText(/Бронь №/)).not.toBeInTheDocument()
    expect(screen.getByLabelText('Дата')).toHaveValue('2026-12-10')
    expect(screen.getByLabelText('Комната')).toHaveValue('12')
  })

  it('не отправляет запрос, если время окончания не позже начала', async () => {
    renderWithProviders(<BookingForm rooms={ROOMS} />)
    await fillForm({ from: '14:00', to: '14:00' })

    expect(createBooking).not.toHaveBeenCalled()
    expect(screen.getByText('Время окончания должно быть позже времени начала.')).toBeInTheDocument()
  })
})
