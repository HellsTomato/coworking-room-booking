# UI-flow frontend

Документ связывает экраны React-приложения с ролями, восемью пользовательскими функциями и HTTP-интерфейсом из [api-contract.md](api-contract.md). Все запросы frontend отправляет на `/api/v1`; в Docker Compose Vite проксирует `/api` на `backend:8080`.

## 1. Сценарии пользователей

### Employee (`EMPLOYEE`)

1. Открывает `/register`, создаёт аккаунт, затем входит на `/login` и получает JWT.
2. На `/rooms` фильтрует комнаты по вместимости, оборудованию и интервалу `from`–`to`.
3. Выбирает комнату и переходит на `/bookings/new`, указывает начало и окончание, отправляет заявку. Бронь создаётся в статусе `PENDING`.
4. На `/bookings` видит активные брони (`PENDING`, `CONFIRMED`) и может отменить свою бронь, пока это разрешает правило 3 контракта.
5. На `/bookings/history` видит завершённые, отменённые и отклонённые брони.
6. Для брони `COMPLETED` из истории переходит на `/rooms/:roomId/review` и оставляет один отзыв.

### Admin (`ADMIN`)

1. Входит на `/login`.
2. На `/admin/rooms` добавляет, редактирует и архивирует комнаты.
3. На `/admin/bookings` просматривает заявки `PENDING`, подтверждает (`CONFIRMED`) или отклоняет (`REJECTED`) их.

```text
          /register ──► /login
                          │
          ┌───────────────┴────────────────┐
       EMPLOYEE                          ADMIN
          │                                │
       /rooms ──► /bookings/new        /admin/rooms
          │             │              /admin/bookings
          │             ▼
          │        /bookings ──► /bookings/history ──► /rooms/:roomId/review
```

## 2. Карта страниц и маршрутов

| Маршрут | Компонент | Роль | Назначение | ЛР |
|---|---|---|---|---|
| `/` | редирект | — | Перенаправление на `/rooms` | 1 |
| `/login` | `LoginPage` | Гость | Вход, получение JWT | 2 |
| `/register` | `RegisterPage` | Гость | Регистрация | 2 |
| `/rooms` | `RoomsPage` | Авторизованный | Список комнат и фильтры | 3 |
| `/bookings/new` | `NewBookingPage` | `EMPLOYEE` | Создание бронирования | 3 |
| `/bookings` | `MyBookingsPage` | `EMPLOYEE` | Активные брони и отмена | 3 |
| `/bookings/history` | `BookingHistoryPage` | `EMPLOYEE` | История бронирований | 4 |
| `/admin/rooms` | `AdminRoomsPage` | `ADMIN` | Управление комнатами | 4 |
| `/admin/bookings` | `AdminBookingsPage` | `ADMIN` | Подтверждение и отклонение заявок | 4 |
| `/rooms/:roomId/review` | `ReviewPage` | `EMPLOYEE` | Создание отзыва | 5 |
| `*` | `NotFoundPage` | — | Неизвестный маршрут | 1 |

Маршруты описаны в `frontend/src/routes/AppRoutes.jsx`, страницы — в `frontend/src/pages/`. В ЛР №1 проверки ролей на frontend нет: JWT и guard-маршруты добавляются в ЛР №2.

## 3. Соответствие восьми функциям

| № | Функция | Экран | Endpoint |
|---|---|---|---|
| 1 | Регистрация и вход | `/register`, `/login` | `POST /auth/register`, `POST /auth/login` |
| 2 | Поиск комнат с фильтрами | `/rooms` | `GET /rooms?capacity=&equipment=&from=&to=` |
| 3 | Создание бронирования | `/bookings/new` | `POST /bookings` |
| 4 | Активные брони и отмена | `/bookings` | `GET /bookings/me?scope=active`, `PATCH /bookings/{id}/cancel` |
| 5 | История бронирований | `/bookings/history` | `GET /bookings/me?scope=history` |
| 6 | Управление комнатами | `/admin/rooms` | `POST /admin/rooms`, `PUT /admin/rooms/{id}`, `PATCH /admin/rooms/{id}/archive` |
| 7 | Решения по заявкам | `/admin/bookings` | `GET /admin/bookings?status=PENDING`, `PATCH /admin/bookings/{id}/confirm`, `PATCH /admin/bookings/{id}/reject` |
| 8 | Отзыв о комнате | `/rooms/:roomId/review` | `POST /rooms/{roomId}/reviews` |

Функции API-клиента для каждой строки — в `frontend/src/api/endpoints.js`.

## 4. Данные, которые frontend ожидает от backend

| Экран | Запрос | Ответ |
|---|---|---|
| `/register` | `email`, `password`, `displayName` | Созданный пользователь или ошибка валидации |
| `/login` | `email`, `password` | `token` (JWT) и `user` с полями `id`, `email`, `displayName`, `role` |
| `/rooms` | фильтры `capacity`, `equipment`, `from`, `to` | Массив комнат: `id`, `name`, `capacity`, `equipment` |
| `/bookings/new` | `roomId`, `startsAt`, `endsAt` | Созданная бронь: `id`, `room`, `startsAt`, `endsAt`, `status` |
| `/bookings`, `/bookings/history` | `scope` | Массив броней: `id`, `room { id, name }`, `startsAt`, `endsAt`, `status` |
| `/admin/rooms` | `name`, `capacity`, `equipment` | Комната с полем `archived` |
| `/admin/bookings` | `status` | Массив броней с автором: `user { id, displayName, email }` |
| `/rooms/:roomId/review` | `bookingId`, `rating`, `comment` | Созданный отзыв: `id`, `rating`, `comment`, `createdAt` |

Общие требования:

- даты — ISO-8601 с offset, как указано в контракте;
- JWT передаётся в заголовке `Authorization: Bearer <token>` (`frontend/src/api/client.js`);
- ошибки — JSON с полем `message`; frontend показывает его пользователю, а при `401` удаляет токен;
- роль пользователя нужна frontend сразу после входа, чтобы показать разделы `EMPLOYEE` или `ADMIN`.

## 5. Открытые вопросы к API-контракту

1. Формат ответа `POST /auth/login` и наличие `GET /auth/me` для восстановления роли после перезагрузки страницы.
2. Как администратор получает список комнат, включая архивные: `GET /rooms` скрывает архивные комнаты по правилу 4.
3. Формат параметра `equipment`: одно значение или список через запятую.
4. Какие статусы входят в `scope=active` и `scope=history`, и кто переводит бронь в `COMPLETED`.
5. Тело `POST /rooms/{roomId}/reviews`: передаётся ли `bookingId` (в сущности `Review` связь с бронью уникальна).
6. Единый формат ошибок (`message`, `errors` по полям) для валидации форм.
