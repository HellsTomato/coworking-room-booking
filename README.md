# Coworking Room Booking System

Система бронирования переговорных комнат коворкинга. Сотрудники ищут доступные
комнаты и создают заявки; администратор управляет комнатами и подтверждает либо
отклоняет брони.

Проект состоит из двух частей:

| Часть | Технологии | Каталог |
|---|---|---|
| Backend REST API | Java 21, Spring Boot 3.4.2, Spring Security, Spring Data JPA, H2/PostgreSQL, Maven | `backend/` |
| Frontend SPA | JavaScript, React 18, React Router, Axios, Vite | `frontend/` |

## Предварительные требования

- Docker Desktop 4+ с запущенным Docker Engine;
- Node.js 22+ и npm 10+ — только для локального запуска frontend без Docker.

## Быстрый старт

```bash
docker compose up --build
```

Одна команда поднимает backend и frontend:

| Сервис | Адрес | Проверка |
|---|---|---|
| Frontend | <http://localhost:5173> | открывается каталог комнат |
| Backend health | <http://localhost:8080/actuator/health> | `{"status":"UP"}` |

Frontend открывается на <http://localhost:5173>, backend health доступен на
<http://localhost:8080/actuator/health>. Сборка Maven и тесты backend
выполняются внутри Docker-образа; локальные Java и Maven не нужны. Данные H2
сохраняются в Docker volume `backend-h2-data`.

### Демонстрационный режим

Backend на момент ЛР №4 реализует только `POST /api/v1/bookings`; вход, каталог,
отмена и отзывы ещё не реализованы на сервере. Чтобы frontend можно было
проверить целиком, в Docker Compose включён встроенный mock API
(`VITE_MOCK_API=true`). Он повторяет контракт
[interface-contract.md](docs/interface-contract.md), включая `409`.

Тестовые учётные записи:

| Роль | Email | Пароль |
|---|---|---|
| Сотрудник | `employee@example.com` | `Secret123!` |
| Администратор | `admin@example.com` | `Secret123!` |

Как увидеть ошибку 409:

1. Войти как `employee@example.com`.
2. В каталоге открыть комнату «Альфа» → «Забронировать».
3. Выбрать дату в ближайшие две недели, интервал `11:00`–`13:00`.
4. Нажать «Создать бронь» — появится блок «Выбранное время уже занято», форма
   сохранит данные, новая бронь не создастся.

Чтобы работать с настоящим backend, отключите mock. PowerShell:

```powershell
$env:VITE_MOCK_API = "false"
docker compose up --build
```

bash:

```bash
VITE_MOCK_API=false docker compose up --build
```

## Запуск backend

```bash
docker compose up --build backend
```

### Проверка работоспособности

1. Запустить backend командой выше.
2. Открыть <http://localhost:8080/actuator/health>.
3. Ожидаемый ответ: `{"status":"UP"}`.

## Запуск frontend

Рекомендуемый способ — Docker (локальный Node.js не требуется):

```bash
docker compose up --build frontend
```

Vite поднимается внутри контейнера, исходники копируются в образ. После
изменений в коде пересоберите контейнер командой `docker compose up --build frontend`.
Остановка — `docker compose down`.

Локальный запуск без Docker:

```bash
cd frontend
npm ci
npm run dev
```

Vite проксирует запросы `/api` на `VITE_PROXY_TARGET` (по умолчанию
`http://localhost:8080`). В Docker Compose переменная указывает на
`http://backend:8080`, поэтому браузер обращается к API same-origin и CORS не
требуется.

## Frontend: команды проверки

Все npm-команды запускаются через Docker из корня проекта:

```bash
docker compose run --rm --no-deps frontend npm run lint
docker compose run --rm --no-deps frontend npm run test:run
docker compose run --rm --no-deps frontend npm run build
```

| Команда | Что проверяет |
|---|---|
| `npm run lint` | ESLint: ошибки и потенциально опасные конструкции в JS/JSX. |
| `npm run test:run` | Vitest + React Testing Library: 3 файла, 7 тестов. |
| `npm run build` | Продакшен-сборка Vite в `frontend/dist`. |

Локальные эквиваленты (из каталога `frontend`):

```bash
npm ci
npm run lint
npm run test:run
npm run build
```

Тесты frontend:

| Файл | Сценарии |
|---|---|
| `frontend/src/components/BookingForm.test.jsx` | Успешное создание брони, ошибка `409`, граничный случай `timeFrom >= timeTo`. |
| `frontend/src/pages/CatalogPage.test.jsx` | Успешная загрузка каталога и отображение ошибки API с повтором. |
| `frontend/src/App.test.jsx` | Защищённые маршруты: редирект на вход и запрет админ-раздела для сотрудника. |

## Backend-тесты

Тесты и сборка запускаются в Docker из каталога `backend`:

```powershell
docker build --target test --tag coworking-room-booking-backend:test backend
docker build --tag coworking-room-booking-backend:ci backend
docker compose up --build
```

Стадия `test` выполняет `mvn test`; финальная сборка выполняет `mvn verify`.

## CI

| Workflow | Файл | Когда запускается | Шаги |
|---|---|---|---|
| Backend CI | `.github/workflows/backend-ci.yml` | Все PR; push в `main` и `lab-*` | Maven-тесты и сборка образа в Docker |
| Frontend CI | `.github/workflows/frontend-ci.yml` | Все PR; push в `main` и `lab-*` | `npm ci`, `npm run lint`, `npm run test:run`, `npm run build` |

Оба workflow запускаются на `ubuntu-24.04`. Backend использует Docker, frontend — Node.js 22.

## Протокол проверки запуска

| Дата | ОС | Проверял | Окружение | Результат |
|---|---|---|---|---|
| 2026-11-01 | Windows | Backend Developer | Docker 29.9.2 / Compose 5.6.1 | Backend собирается и отвечает на health-check |
| 2026-11-17 | Windows | Frontend Developer | Docker 29.9.2 / Compose 5.6.1, Node.js 22.22.2 | `npm run lint` — 0 ошибок; `npm run test:run` — 7/7 тестов; `npm run build` — успешно; demo-flow 409 проверен в браузере |

## Статус требований

| ID | Формулировка | Приоритет | Состояние |
|---|---|---|---|
| FR-1 | Регистрация, вход и JWT для ролей `EMPLOYEE` и `ADMIN` | Обязательно | Backend — нужно сделать; UI входа и защищённых маршрутов готов |
| FR-2 | Поиск доступных комнат без пересечений | Обязательно | Backend — нужно сделать; UI фильтров готов |
| FR-3 | Создание брони на выбранный слот | Обязательно | UI готов; backend дорабатывается |
| FR-4 | Отмена собственной брони | Обязательно | UI готов; backend — нужно сделать |
| FR-5 | Каталог комнат и фильтры по вместимости, оборудованию и доступности | Обязательно | UI реализован (ЛР №3–4) |
| FR-6 | Мои активные брони и история бронирований | Обязательно | UI реализован |
| FR-7 | Административное управление комнатами | Обязательно | UI реализован |
| FR-8 | Отзывы после подтверждённой завершённой брони | Обязательно | UI реализован |

Нефункциональные требования NFR-1---NFR-5 зафиксированы в
[docs/01-requirements.md](docs/01-requirements.md).

## Структура проекта

```text
backend/                    Spring Boot REST API и backend-тесты
frontend/                   React SPA
  src/api/                  Axios-экземпляр и модули API
  src/auth/                 контекст входа, JWT и защищённые маршруты
  src/components/           переиспользуемые компоненты и формы
  src/pages/                страницы каталога, броней и администрирования
  src/test/                 настройка Vitest и обёртка для тестов
  mock/                     демонстрационный mock API для Vite
docs/                       требования, контракты, UI-flow и диаграммы
  diagrams/                 Mermaid-исходники и PNG-экспорт
.github/workflows/          backend-ci.yml и frontend-ci.yml
compose.yaml                backend + frontend
```

## Документация

- [Паспорт проекта](docs/00-project.md)
- [Требования и пользовательские сценарии](docs/01-requirements.md)
- [Карта REST API](docs/api-contract.md)
- [Контракт создания бронирования](docs/interface-contract.md)
- [UI-flow: экраны, маршруты и состояния](docs/ui-flow.md)
- [Диаграммы](docs/diagrams/)

## Известные ограничения

- Backend реализует только `POST /api/v1/bookings`; операции FR-1, FR-2, FR-4,
  FR-6---FR-8 описаны контрактом, но ещё не реализованы на сервере. Поэтому
  сквозная демонстрация использует mock API, а тесты frontend подменяют
  API-модули.
- Административный экран запрашивает `GET /api/v1/rooms?includeArchived=true`;
  параметр поддержан mock API и должен быть реализован backend вместе с FR-7.
- JWT хранится в `localStorage`; для production нужен более защищённый способ
  хранения (httpOnly-cookie или refresh-токен).
- Frontend запускается dev-сервером Vite; production-сборка (`npm run build`)
  проверяется в CI, но nginx-раздача в этом семестре не настроена.
- Состояние mock API хранится в памяти и сбрасывается при перезапуске контейнера.

## Лицензия

Проект распространяется по лицензии MIT — см. [LICENSE](LICENSE).
