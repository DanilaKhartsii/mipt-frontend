# GigaChat Frontend

React + TypeScript + Vite чат-интерфейс для GigaChat API.

## Демо

> Ссылка добавляется после деплоя на Vercel.

Скриншот приложения:

![Bundle Analysis](docs/bundle-screenshot.png)

---

## Стек

| Технология | Версия |
|---|---|
| React | 19.2.0 |
| TypeScript | 5.9.x |
| Vite | 7.x |
| React Router DOM | 7.x |
| react-markdown | 10.x |
| Vitest | 4.x |
| @testing-library/react | 16.x |

---

## Запуск локально

```bash
git clone https://github.com/<your-username>/gigachat-frontend.git
cd gigachat-frontend
npm install
cp .env.example .env.local
# Заполните GIGACHAT_CREDENTIALS в .env.local
npm run dev
```

Приложение откроется на [http://localhost:5173](http://localhost:5173).

> При первом запуске без серверных credentials введите свою Base64-строку в форме входа.

---

## Переменные окружения

| Переменная | Где задаётся | Описание |
|---|---|---|
| `GIGACHAT_CREDENTIALS` | Сервер (Vercel) | Base64 от `ClientID:ClientSecret` GigaChat API |
| `GIGACHAT_SCOPE` | Сервер (Vercel) | Scope API: `GIGACHAT_API_PERS` / `GIGACHAT_API_B2B` / `GIGACHAT_API_CORP`. По умолчанию `GIGACHAT_API_PERS` |
| `VITE_SKIP_AUTH` | Клиент (публичная) | `true` — скрывает форму входа (используются серверные credentials) |

> Серверные переменные (`GIGACHAT_CREDENTIALS`, `GIGACHAT_SCOPE`) **не попадают в клиентский бандл** и доступны только в Vercel serverless-функции `api/chat.ts`.

---

## Анализ бандла

Запуск визуализатора:

```bash
npx vite-bundle-visualizer --output docs/bundle-report.html
```

Открыть отчёт: `docs/bundle-report.html`

Основные чанки после оптимизации:

| Чанк | Размер (gzip) | Содержимое |
|---|---|---|
| `index-*.js` | ~75 kB | React, ReactDOM, React Router |
| `ChatPage-*.js` | ~41 kB | AppLayout, MessageList, **react-markdown** |
| `SettingsPanel-*.js` | ~1.6 kB | Панель настроек (lazy) |
| `Sidebar-*.js` | ~1.3 kB | Боковая панель чатов (lazy) |
| `AuthPage-*.js` | ~1.0 kB | Форма входа (lazy) |

`react-markdown` находится в отдельном чанке `ChatPage` и **не попадает в основной бандл**.

---

## Архитектурные решения

### Code Splitting (React.lazy + Suspense)
- `AuthPage` и `ChatPage` — ленивые роут-чанки
- `Sidebar` и `SettingsPanel` — ленивые компоненты внутри `AppLayout`

### Оптимизация ререндеров
- `ChatItem` обёрнут в `React.memo` — не перерисовывается при смене другого чата
- Фильтр чатов в `Sidebar` мемоизирован через `useMemo`
- Обработчики в `ChatPage` стабилизированы через `useCallback`

### Error Boundary
- `ErrorBoundary` (классовый компонент) изолирует ошибки рендера вокруг `MessageList`
- Ошибки API отображаются через `ErrorMessage` под полем ввода
- Кнопка «Повторить» в `ErrorBoundary`

### GigaChat API
- Все запросы проходят через Vercel serverless функцию `/api/chat`
- Функция решает проблему CORS и отсутствия CA-сертификата Сбербанка в стандартных хранилищах
- Токен кешируется в памяти между тёплыми вызовами функции

---

## Тесты

```bash
npm test                # однократный прогон (45 тестов)
npm run test:watch      # режим наблюдения
npm run test:coverage   # с отчётом покрытия
npx vitest run src/store/chatReducer.test.ts  # отдельный файл
```