import axios from 'axios'

export const ERROR_MESSAGES = {
  0: 'Не удалось связаться с сервером. Проверьте, что backend запущен, и повторите попытку.',
  400: 'Проверьте заполнение полей: сервер отклонил запрос.',
  401: 'Сессия истекла или токен недействителен. Войдите в систему снова.',
  403: 'Недостаточно прав для этой операции.',
  404: 'Запрашиваемые данные не найдены.',
  409: 'Этот интервал уже занят другой бронью. Выберите другое время или другую комнату.',
  500: 'На сервере произошла ошибка. Повторите попытку позже.',
}

const CODES_BY_STATUS = {
  0: 'NETWORK_ERROR',
  400: 'VALIDATION_ERROR',
  401: 'UNAUTHORIZED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  409: 'CONFLICT',
  500: 'SERVER_ERROR',
}

export class ApiError extends Error {
  constructor({ status = 0, code = 'UNKNOWN_ERROR', message, serverMessage = '', details = null } = {}) {
    super(message || ERROR_MESSAGES[status] || ERROR_MESSAGES[0])
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.serverMessage = serverMessage
    this.details = details
  }

  get isConflict() {
    return this.status === 409
  }

  get isUnauthorized() {
    return this.status === 401
  }
}

export function toApiError(error) {
  if (error instanceof ApiError) {
    return error
  }

  if (axios.isAxiosError(error)) {
    const status = error.response?.status ?? 0
    const data = error.response?.data
    const serverMessage =
      typeof data === 'string' ? data : typeof data?.message === 'string' ? data.message : ''
    const code =
      (typeof data === 'object' && data !== null && typeof data.code === 'string' && data.code) ||
      CODES_BY_STATUS[status] ||
      'UNKNOWN_ERROR'

    return new ApiError({
      status,
      code,
      message: ERROR_MESSAGES[status] || ERROR_MESSAGES[0],
      serverMessage,
      details: data?.details ?? null,
    })
  }

  return new ApiError({
    status: 0,
    code: 'UNKNOWN_ERROR',
    serverMessage: error instanceof Error ? error.message : '',
  })
}
