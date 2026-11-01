## Что сделано

Closes #

## Как проверить

```bash
docker compose config
docker compose up --build
```

- [ ] frontend открывается на http://localhost:5173
- [ ] http://localhost:8080/actuator/health возвращает `{"status":"UP"}`
- [ ] основные маршруты открываются без ошибок
- [ ] `docker compose logs` без ошибок сборки и запуска
- [ ] `docker compose down` останавливает окружение

## Результаты запуска

## Чек-лист

- [ ] Коммиты атомарные, сообщения в формате Conventional Commits
- [ ] Документация обновлена (README, docs/)
- [ ] Изменения API согласованы с `docs/api-contract.md`
- [ ] Назначен reviewer, добавлена метка `review`

## Известные ограничения
