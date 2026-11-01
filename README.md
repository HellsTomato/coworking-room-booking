# Coworking Room Booking System

Система бронирования переговорных комнат коворкинга. Сотрудники ищут доступные комнаты и создают заявки; администратор управляет комнатами и подтверждает либо отклоняет брони.

## Предварительные требования

- Docker Desktop 4+ (или OrbStack) с запущенным Docker Engine;
- свободные порты `5173` и `8080`.

Локальные Java, Maven, Node.js и npm не нужны: сборка и тесты выполняются внутри Docker-образов.

## Запуск системы

```bash
docker compose up --build
```

| Сервис | Адрес | Что внутри |
|---|---|---|
| `frontend` | http://localhost:5173 | React SPA (`vite preview`), запросы `/api` проксируются на `backend:8080` |
| `backend` | http://localhost:8080 | Spring Boot API, данные H2 в volume `backend-h2-data` |

Остановка: `docker compose down`.

## Проверка работоспособности

1. `docker compose config` — конфигурация без ошибок.
2. `docker compose up --build` — оба контейнера в статусе `Up`.
3. `http://localhost:8080/actuator/health` → `{"status":"UP"}`.
4. `http://localhost:5173` открывает приложение; ссылки навигации переключают маршруты `/rooms`, `/bookings/new`, `/bookings`, `/bookings/history`, `/admin/rooms`, `/admin/bookings`, `/login`, `/register`, `/rooms/:roomId/review`.
5. `docker compose logs` не содержит ошибок сборки и запуска.
6. `docker compose down` удаляет контейнеры и сеть.

## Документация

- [Паспорт проекта](docs/00-project.md)
- [API-контракт](docs/api-contract.md)
- [UI-flow: сценарии, маршруты и данные API](docs/ui-flow.md)

## Протокол проверки запуска

| Дата | ОС | Проверял | Docker | Результат |
|---|---|---|---|---|
| 2026-11-01 | Windows | Backend Developer | Docker 29.9.2 / Compose 5.6.1 | Конфигурация подготовлена; проверка образа выполняется в CI |
| 2026-11-01 | macOS 14.8.4 | Frontend Developer | Docker 29.8.2 (OrbStack) / Compose 5.5.0 | `docker compose config` — OK; `up --build` — оба сервиса `Up`; health — `{"status":"UP"}`; 9 маршрутов и навигация работают, ошибок в консоли браузера нет; `/api/v1/rooms` через proxy → `403` (ожидаемо до ЛР №2); в логах нет ошибок; `down` — OK. Порт 8080 на хосте был занят сторонним процессом, health проверен из сети Compose и через временный порт `18080` |

## Статус требований

| Требование | Статус |
|---|---|
| Две роли: сотрудник и администратор | Зафиксировано в модели и API-контракте |
| Четыре сущности | Каркас создан |
| Восемь функций | Спланировано в API-контракте; экраны сопоставлены в UI-flow |
| JWT и бизнес-логика | ЛР №2–4 |
