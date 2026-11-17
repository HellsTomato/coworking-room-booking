/**
 * Демонстрационный mock API для локального запуска без завершённого backend.
 *
 * Включается только при VITE_MOCK_API=true и только в dev-режиме Vite.
 * По умолчанию frontend работает с настоящим backend через прокси /api.
 * Контракт повторяет docs/interface-contract.md, включая ошибку 409.
 */
const DEMO_PASSWORD = 'Secret123!'
const ACTIVE_STATUSES = new Set(['PENDING', 'CONFIRMED'])

const state = createState()

function addDaysIso(days) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  const pad = (value) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function createState() {
  const bookings = []
  let bookingId = 1

  // Занятые слоты «Альфы» на ближайшие две недели: удобно проверять 409 в демо.
  for (let day = 1; day <= 14; day += 1) {
    bookings.push({
      bookingId: bookingId++,
      roomId: 1,
      userId: 2,
      date: addDaysIso(day),
      timeFrom: '10:00',
      timeTo: '12:00',
      offset: '+03:00',
      status: 'CONFIRMED',
    })
  }

  const pendingBookingId = bookingId++
  bookings.push({
    bookingId: pendingBookingId,
    roomId: 2,
    userId: 1,
    date: addDaysIso(3),
    timeFrom: '14:00',
    timeTo: '15:00',
    offset: '+03:00',
    status: 'PENDING',
  })

  const completedBookingId = bookingId++
  bookings.push({
    bookingId: completedBookingId,
    roomId: 2,
    userId: 1,
    date: addDaysIso(-16),
    timeFrom: '09:00',
    timeTo: '10:00',
    offset: '+03:00',
    status: 'COMPLETED',
  })

  return {
    users: [
      {
        userId: 1,
        email: 'employee@example.com',
        fullName: 'Анна Смирнова',
        password: DEMO_PASSWORD,
        role: 'EMPLOYEE',
      },
      {
        userId: 2,
        email: 'admin@example.com',
        fullName: 'Игорь Петров',
        password: DEMO_PASSWORD,
        role: 'ADMIN',
      },
    ],
    rooms: [
      { id: 1, name: 'Альфа', capacity: 4, equipment: 'projector, whiteboard', archived: false },
      { id: 2, name: 'Бета', capacity: 6, equipment: 'projector, video', archived: false },
      { id: 3, name: 'Гамма', capacity: 8, equipment: 'whiteboard', archived: false },
      { id: 4, name: 'Дельта', capacity: 10, equipment: 'projector, video, speakerphone', archived: false },
      { id: 5, name: 'Омега', capacity: 12, equipment: 'video, speakerphone', archived: false },
      { id: 6, name: 'Архивная', capacity: 6, equipment: 'projector', archived: true },
    ],
    bookings,
    reviews: [
      {
        reviewId: 1,
        roomId: 2,
        bookingId: completedBookingId,
        userId: 1,
        authorName: 'Анна Смирнова',
        rating: 5,
        comment: 'Тихая комната, проектор и видеосвязь работают.',
        createdAt: `${addDaysIso(-15)}T10:15:00+03:00`,
      },
    ],
    nextBookingId: bookingId,
    nextRoomId: 7,
    nextReviewId: 2,
  }
}

function send(res, status, body) {
  const payload = body === undefined ? '' : JSON.stringify(body)
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.end(payload)
}

function fail(res, status, code, message) {
  send(res, status, { code, message })
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = ''
    req.on('data', (chunk) => {
      raw += chunk
      if (raw.length > 1_000_000) {
        reject(new Error('payload too large'))
        req.destroy()
      }
    })
    req.on('end', () => {
      if (!raw) {
        resolve({})
        return
      }
      try {
        resolve(JSON.parse(raw))
      } catch {
        reject(new Error('invalid json'))
      }
    })
    req.on('error', reject)
  })
}

function pathWithoutApiPrefix(rawUrl) {
  const path = (rawUrl || '/').split('?')[0]
  return path.startsWith('/api/') ? path.slice(4) : path
}

function currentUser(req) {
  const header = req.headers.authorization || ''
  const match = /^Bearer mock\.(\d+)$/.exec(header)
  if (!match) {
    return null
  }
  return state.users.find((user) => user.userId === Number(match[1])) || null
}

function publicUser(user) {
  return { userId: user.userId, email: user.email, fullName: user.fullName, role: user.role }
}

function tokenFor(user) {
  return `mock.${user.userId}`
}

function parseTime(value) {
  const match = /^(\d{2}):(\d{2})(?::\d{2})?(?:([+-]\d{2}):(\d{2}))?$/.exec(String(value || ''))
  if (!match) {
    return null
  }
  return {
    hhmm: `${match[1]}:${match[2]}`,
    minutes: Number(match[1]) * 60 + Number(match[2]),
    offset: match[3] ? `${match[3]}:${match[4]}` : '+00:00',
  }
}

function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ''))) {
    return false
  }
  const parsed = new Date(`${value}T00:00:00`)
  return !Number.isNaN(parsed.getTime())
}

function todayIso() {
  const now = new Date()
  const pad = (value) => String(value).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

function bookingDto(booking) {
  const room = state.rooms.find((item) => item.id === booking.roomId)
  return {
    bookingId: booking.bookingId,
    roomId: booking.roomId,
    roomName: room?.name,
    userId: booking.userId,
    date: booking.date,
    timeFrom: `${booking.timeFrom}:00${booking.offset}`,
    timeTo: `${booking.timeTo}:00${booking.offset}`,
    status: booking.status,
  }
}

function roomDto(room) {
  return { ...room }
}

function overlaps(first, second) {
  return (
    first.date === second.date &&
    first.minutesFrom < second.minutesTo &&
    first.minutesTo > second.minutesFrom
  )
}

function bookedIntervals(roomId, statuses = ACTIVE_STATUSES) {
  return state.bookings
    .filter((booking) => booking.roomId === roomId && statuses.has(booking.status))
    .map((booking) => {
      const from = parseTime(booking.timeFrom)
      const to = parseTime(booking.timeTo)
      return {
        date: booking.date,
        minutesFrom: from?.minutes ?? 0,
        minutesTo: to?.minutes ?? 0,
      }
    })
}

function overlapsAny(roomId, candidate, statuses = ACTIVE_STATUSES) {
  return bookedIntervals(roomId, statuses).some((interval) => overlaps(candidate, interval))
}

function cancelReason(booking) {
  if (!ACTIVE_STATUSES.has(booking.status)) {
    return 'BOOKING_NOT_CANCELLABLE'
  }
  const slotStart = new Date(`${booking.date}T${booking.timeFrom}:00`)
  if (!Number.isNaN(slotStart.getTime()) && slotStart.getTime() <= Date.now()) {
    return 'BOOKING_ALREADY_STARTED'
  }
  return null
}

function authenticate(req, res, role) {
  const user = currentUser(req)
  if (!user) {
    fail(res, 401, 'UNAUTHORIZED', 'JWT is missing or invalid')
    return null
  }
  if (role && user.role !== role) {
    fail(res, 403, 'FORBIDDEN', role === 'ADMIN' ? 'Admin role required' : 'Employee role required')
    return null
  }
  return user
}

async function handle(req, res) {
  const url = new URL(req.url || '/', 'http://localhost')
  const path = pathWithoutApiPrefix(req.url)
  const method = (req.method || 'GET').toUpperCase()

  if (method === 'POST' && path === '/v1/auth/login') {
    const body = await readBody(req)
    const email = String(body.email || '').trim().toLowerCase()
    const user = state.users.find((item) => item.email.toLowerCase() === email)
    if (!body.email || !body.password) {
      fail(res, 400, 'VALIDATION_ERROR', 'Invalid fields: email, password')
      return
    }
    if (!user || user.password !== body.password) {
      fail(res, 401, 'UNAUTHORIZED', 'Invalid email or password')
      return
    }
    send(res, 200, { token: tokenFor(user), user: publicUser(user) })
    return
  }

  if (method === 'POST' && path === '/v1/auth/register') {
    const body = await readBody(req)
    const email = String(body.email || '').trim().toLowerCase()
    const fullName = String(body.fullName || '').trim()
    const password = String(body.password || '')
    if (!email || !fullName || password.length < 8) {
      fail(res, 400, 'VALIDATION_ERROR', 'Invalid fields: email, fullName, password')
      return
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      fail(res, 400, 'VALIDATION_ERROR', 'Invalid fields: email')
      return
    }
    if (state.users.some((item) => item.email.toLowerCase() === email)) {
      fail(res, 400, 'VALIDATION_ERROR', 'Email is already registered')
      return
    }
    const user = {
      userId: Math.max(...state.users.map((item) => item.userId)) + 1,
      email,
      fullName,
      password,
      role: 'EMPLOYEE',
    }
    state.users.push(user)
    send(res, 201, { token: tokenFor(user), user: publicUser(user) })
    return
  }

  if (method === 'GET' && path === '/v1/rooms') {
    const capacity = Number(url.searchParams.get('capacity') || 0)
    const equipment = String(url.searchParams.get('equipment') || '').toLowerCase()
    const includeArchived = url.searchParams.get('includeArchived') === 'true'
    const from = url.searchParams.get('from')
    const to = url.searchParams.get('to')

    let fromTime = null
    let toTime = null
    if (from && to) {
      const fromMatch = /^\d{4}-\d{2}-\d{2}T(\d{2}):(\d{2})/.exec(from)
      const toMatch = /^\d{4}-\d{2}-\d{2}T(\d{2}):(\d{2})/.exec(to)
      const fromDate = from.slice(0, 10)
      const toDate = to.slice(0, 10)
      if (!fromMatch || !toMatch) {
        fail(res, 400, 'VALIDATION_ERROR', 'Invalid interval')
        return
      }
      fromTime = {
        date: fromDate,
        minutesFrom: Number(fromMatch[1]) * 60 + Number(fromMatch[2]),
        minutesTo: Number(fromMatch[1]) * 60 + Number(fromMatch[2]),
      }
      toTime = {
        date: toDate,
        minutesFrom: Number(toMatch[1]) * 60 + Number(toMatch[2]),
        minutesTo: Number(toMatch[1]) * 60 + Number(toMatch[2]),
      }
      if (fromTime.minutesFrom >= toTime.minutesFrom) {
        fail(res, 400, 'VALIDATION_ERROR', 'timeFrom must be before timeTo')
        return
      }
    }

    const rooms = state.rooms.filter((room) => {
      if (!includeArchived && room.archived) {
        return false
      }
      if (capacity > 0 && room.capacity < capacity) {
        return false
      }
      if (equipment && !room.equipment.toLowerCase().includes(equipment)) {
        return false
      }
      if (fromTime && toTime) {
        const candidate = {
          date: fromTime.date,
          minutesFrom: fromTime.minutesFrom,
          minutesTo: toTime.minutesFrom,
        }
        if (overlapsAny(room.id, candidate)) {
          return false
        }
      }
      return true
    })

    send(res, 200, rooms.map(roomDto))
    return
  }

  const roomMatch = /^\/v1\/rooms\/(\d+)$/.exec(path)
  if (method === 'GET' && roomMatch) {
    const room = state.rooms.find((item) => item.id === Number(roomMatch[1]))
    if (!room) {
      fail(res, 404, 'NOT_FOUND', 'Room not found')
      return
    }
    send(res, 200, roomDto(room))
    return
  }

  const reviewsMatch = /^\/v1\/rooms\/(\d+)\/reviews$/.exec(path)
  if (reviewsMatch) {
    const roomId = Number(reviewsMatch[1])
    if (method === 'GET') {
      send(res, 200, state.reviews.filter((review) => review.roomId === roomId))
      return
    }
    if (method === 'POST') {
      const user = authenticate(req, res, 'EMPLOYEE')
      if (!user) {
        return
      }
      const body = await readBody(req)
      const rating = Number(body.rating)
      const booking = state.bookings.find((item) => item.bookingId === Number(body.bookingId))
      if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        fail(res, 400, 'VALIDATION_ERROR', 'Rating must be an integer between 1 and 5')
        return
      }
      if (!booking || booking.userId !== user.userId || booking.roomId !== roomId) {
        fail(res, 403, 'FORBIDDEN', 'Review requires a completed own booking')
        return
      }
      if (booking.status !== 'COMPLETED') {
        fail(res, 403, 'FORBIDDEN', 'Review requires a completed booking')
        return
      }
      if (state.reviews.some((review) => review.bookingId === booking.bookingId)) {
        fail(res, 409, 'REVIEW_ALREADY_EXISTS', 'Review for this booking already exists')
        return
      }
      const review = {
        reviewId: state.nextReviewId++,
        roomId,
        bookingId: booking.bookingId,
        userId: user.userId,
        authorName: user.fullName,
        rating,
        comment: String(body.comment || '').trim(),
        createdAt: new Date().toISOString(),
      }
      state.reviews.push(review)
      send(res, 201, review)
      return
    }
  }

  if (method === 'POST' && path === '/v1/bookings') {
    const user = authenticate(req, res, 'EMPLOYEE')
    if (!user) {
      return
    }
    const body = await readBody(req)
    const roomId = Number(body.roomId)
    const room = state.rooms.find((item) => item.id === roomId)
    if (!room || room.archived) {
      fail(res, 400, 'VALIDATION_ERROR', 'Room does not exist or is archived')
      return
    }
    if (!isValidDate(body.date)) {
      fail(res, 400, 'VALIDATION_ERROR', 'Invalid fields: date')
      return
    }
    if (String(body.date) < todayIso()) {
      fail(res, 400, 'VALIDATION_ERROR', 'Booking date cannot be in the past')
      return
    }
    const from = parseTime(body.timeFrom)
    const to = parseTime(body.timeTo)
    if (!from || !to) {
      fail(res, 400, 'VALIDATION_ERROR', 'Invalid fields: timeFrom, timeTo')
      return
    }
    if (from.minutes >= to.minutes) {
      fail(res, 400, 'VALIDATION_ERROR', 'timeFrom must be before timeTo')
      return
    }
    const candidate = { date: body.date, minutesFrom: from.minutes, minutesTo: to.minutes }
    if (overlapsAny(roomId, candidate)) {
      fail(
        res,
        409,
        'BOOKING_TIME_CONFLICT',
        `Room ${roomId} is already booked for the requested time slot`,
      )
      return
    }
    const booking = {
      bookingId: state.nextBookingId++,
      roomId,
      userId: user.userId,
      date: body.date,
      timeFrom: from.hhmm,
      timeTo: to.hhmm,
      offset: from.offset,
      status: 'PENDING',
    }
    state.bookings.push(booking)
    send(res, 201, bookingDto(booking))
    return
  }

  if (method === 'GET' && path === '/v1/bookings/me') {
    const user = authenticate(req, res, 'EMPLOYEE')
    if (!user) {
      return
    }
    const scope = url.searchParams.get('scope') === 'history' ? 'history' : 'active'
    const bookings = state.bookings
      .filter((booking) => booking.userId === user.userId)
      .filter((booking) => (scope === 'active' ? ACTIVE_STATUSES.has(booking.status) : !ACTIVE_STATUSES.has(booking.status)))
      .sort((first, second) => `${second.date}${second.timeFrom}`.localeCompare(`${first.date}${first.timeFrom}`))
    send(res, 200, bookings.map(bookingDto))
    return
  }

  const cancelMatch = /^\/v1\/bookings\/(\d+)\/cancel$/.exec(path)
  if (method === 'PATCH' && cancelMatch) {
    const user = authenticate(req, res, 'EMPLOYEE')
    if (!user) {
      return
    }
    const booking = state.bookings.find((item) => item.bookingId === Number(cancelMatch[1]))
    if (!booking) {
      fail(res, 404, 'NOT_FOUND', 'Booking not found')
      return
    }
    if (booking.userId !== user.userId) {
      fail(res, 403, 'FORBIDDEN', 'Only the booking owner can cancel it')
      return
    }
    const reason = cancelReason(booking)
    if (reason === 'BOOKING_ALREADY_STARTED') {
      fail(res, 409, reason, 'Confirmed booking cannot be cancelled after its start')
      return
    }
    if (reason) {
      fail(res, 409, reason, 'Booking cannot be cancelled in its current status')
      return
    }
    booking.status = 'CANCELLED'
    send(res, 200, bookingDto(booking))
    return
  }

  if (method === 'POST' && path === '/v1/admin/rooms') {
    const user = authenticate(req, res, 'ADMIN')
    if (!user) {
      return
    }
    const body = await readBody(req)
    const name = String(body.name || '').trim()
    const capacity = Number(body.capacity)
    if (!name || !Number.isInteger(capacity) || capacity < 1) {
      fail(res, 400, 'VALIDATION_ERROR', 'Invalid fields: name, capacity')
      return
    }
    if (state.rooms.some((room) => room.name.toLowerCase() === name.toLowerCase())) {
      fail(res, 400, 'VALIDATION_ERROR', 'Room name already exists')
      return
    }
    const room = {
      id: state.nextRoomId++,
      name,
      capacity,
      equipment: String(body.equipment || '').trim(),
      archived: false,
    }
    state.rooms.push(room)
    send(res, 201, roomDto(room))
    return
  }

  const adminRoomMatch = /^\/v1\/admin\/rooms\/(\d+)$/.exec(path)
  if (method === 'PUT' && adminRoomMatch) {
    const user = authenticate(req, res, 'ADMIN')
    if (!user) {
      return
    }
    const room = state.rooms.find((item) => item.id === Number(adminRoomMatch[1]))
    if (!room) {
      fail(res, 404, 'NOT_FOUND', 'Room not found')
      return
    }
    const body = await readBody(req)
    const name = String(body.name || '').trim()
    const capacity = Number(body.capacity)
    if (!name || !Number.isInteger(capacity) || capacity < 1) {
      fail(res, 400, 'VALIDATION_ERROR', 'Invalid fields: name, capacity')
      return
    }
    room.name = name
    room.capacity = capacity
    room.equipment = String(body.equipment || '').trim()
    send(res, 200, roomDto(room))
    return
  }

  const archiveMatch = /^\/v1\/admin\/rooms\/(\d+)\/archive$/.exec(path)
  if (method === 'PATCH' && archiveMatch) {
    const user = authenticate(req, res, 'ADMIN')
    if (!user) {
      return
    }
    const room = state.rooms.find((item) => item.id === Number(archiveMatch[1]))
    if (!room) {
      fail(res, 404, 'NOT_FOUND', 'Room not found')
      return
    }
    room.archived = true
    send(res, 200, roomDto(room))
    return
  }

  fail(res, 404, 'NOT_FOUND', `Mock endpoint ${method} ${path} is not implemented`)
}

export function mockApiPlugin() {
  let enabled = false

  return {
    name: 'coworking-mock-api',
    apply: 'serve',
    configResolved() {
      enabled = process.env.VITE_MOCK_API === 'true'
    },
    configureServer(server) {
      if (!enabled) {
        return
      }
      server.config.logger.info(
        'Демонстрационный mock API включён (VITE_MOCK_API=true): employee@example.com / Secret123!',
      )
      server.middlewares.use('/api', (req, res, next) => {
        Promise.resolve(handle(req, res)).catch((error) => {
          server.config.logger.error(`[mock-api] ${error.message}`)
          if (!res.headersSent) {
            fail(res, 500, 'MOCK_ERROR', 'Mock API failed')
          }
        })
        if (next) {
          return
        }
      })
    },
  }
}
