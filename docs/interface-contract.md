# Серверный контракт интерфейса

## Создание бронирования

### Назначение и связи

Операция создаёт заявку сотрудника на свободный временной слот переговорной
комнаты. Она реализует **FR-3** и **US-3** из [01-requirements.md](01-requirements.md).
Реализация backend: `BookingController#create` вызывает
`BookingService#create`.

### Вызов

Операцию вызывает React-форма создания брони через Axios-модуль
`frontend/src/api/`. Клиент отправляет:

```http
POST /api/v1/bookings HTTP/1.1
Host: localhost:8080
Content-Type: application/json
Authorization: Bearer <JWT>
```

`userId` не передаётся клиентом: сервер извлекает пользователя из JWT.

### Входные данные

```json
{
  "roomId": 12,
  "date": "2026-12-10",
  "timeFrom": "10:00:00+03:00",
  "timeTo": "12:00:00+03:00"
}
```

| Поле | Тип | Обязательность и условия |
|---|---|---|
| `roomId` | `long` | Обязательно; комната должна существовать и не быть архивной. |
| `date` | ISO-8601 date | Обязательно; дата не может быть в прошлом. |
| `timeFrom` | ISO-8601 time with offset | Обязательно; начало слота. |
| `timeTo` | ISO-8601 time with offset | Обязательно; должно быть позже `timeFrom`. |

Сервер объединяет `date` и время в `OffsetDateTime`. Новая бронь не создаётся,
если слот пересекается с `PENDING` или `CONFIRMED` бронью той же комнаты.

### Успешный ответ

HTTP `201 Created`:

```json
{
  "bookingId": 42,
  "roomId": 12,
  "userId": 7,
  "date": "2026-12-10",
  "timeFrom": "10:00:00+03:00",
  "timeTo": "12:00:00+03:00",
  "status": "PENDING"
}
```

### Ошибки

| HTTP | Причина | Ожидаемое содержимое |
|---:|---|---|
| `400` | Отсутствует или неверно задано поле; `date` в прошлом; `timeFrom >= timeTo` | Код `VALIDATION_ERROR` и список ошибочных полей |
| `401` | JWT отсутствует, некорректен или просрочен | Код `UNAUTHORIZED` |
| `403` | Пользователь не имеет роли `EMPLOYEE` | Код `FORBIDDEN` |
| `409` | Слот пересекается с активной бронью | Код `BOOKING_TIME_CONFLICT` и сообщение о занятом интервале |

## Пример успешного вызова

Запрос:

```http
POST http://localhost:8080/api/v1/bookings
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.example

{"roomId":12,"date":"2026-12-10","timeFrom":"10:00:00+03:00","timeTo":"12:00:00+03:00"}
```

Ответ:

```http
HTTP/1.1 201 Created
Content-Type: application/json
```

```json
{
  "bookingId": 42,
  "roomId": 12,
  "userId": 7,
  "date": "2026-12-10",
  "timeFrom": "10:00:00+03:00",
  "timeTo": "12:00:00+03:00",
  "status": "PENDING"
}
```

## Пример пересечения

Предположим, комната `12` уже занята подтверждённой бронью с
`10:00:00+03:00` до `12:00:00+03:00`. Запрос на интервал
`11:00:00+03:00`--`13:00:00+03:00`:

```http
POST http://localhost:8080/api/v1/bookings
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.example

{"roomId":12,"date":"2026-12-10","timeFrom":"11:00:00+03:00","timeTo":"13:00:00+03:00"}
```

Ответ:

```http
HTTP/1.1 409 Conflict
Content-Type: application/json
```

```json
{
  "code": "BOOKING_TIME_CONFLICT",
  "message": "Room 12 is already booked for the requested time slot"
}
```
