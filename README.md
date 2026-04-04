# GigaChat Frontend

React + TypeScript + Vite приложение — чат-интерфейс для GigaChat API.

## Запуск

```bash
npm install
npm run dev
```

## Тесты

### Запуск тестов

```bash
npm test               # однократный прогон
npm run test:watch     # режим наблюдения
npm run test:coverage  # с отчётом покрытия
```

### Что покрыто тестами

**Юнит-тесты редьюсера** (`src/store/chatReducer.test.ts`)
- `ADD_MESSAGE` — новое сообщение добавляется в конец массива
- `CREATE_CHAT` — создаётся чат с уникальным id, становится активным
- `DELETE_CHAT` — чат удаляется; при удалении активного сбрасывается `activeChatId`
- `RENAME_CHAT` — название чата обновляется по id

**localStorage** (`src/store/localStorage.test.ts`)
- Данные сохраняются при вызове `saveState`
- Данные корректно восстанавливаются через `loadState`
- При пустом хранилище возвращается `undefined`
- При невалидном JSON приложение не падает

**InputArea** (`src/components/chat/InputArea.test.tsx`)
- Кнопка «Отправить» заблокирована при пустом поле
- При клике на «Отправить» вызывается `onSend` с текстом
- Отправка по Enter
- Shift+Enter не отправляет сообщение
- Поле очищается после отправки
- При `isGenerating=true` поле заблокировано, показывается «Стоп»

**Message** (`src/components/chat/Message.test.tsx`)
- `variant="user"` — текст, имя «Вы», CSS-класс `user`, нет кнопки «Копировать»
- `variant="assistant"` — текст, имя «GigaChat», CSS-класс `assistant`, есть кнопка «Копировать»
- Клик на «Копировать» вызывает `clipboard.writeText` с содержимым сообщения

**Sidebar** (`src/components/sidebar/Sidebar.test.tsx`)
- При пустом запросе отображаются все чаты
- Поиск фильтрует чаты по названию в реальном времени
- Поиск регистронезависимый
- При очистке поиска все чаты возвращаются
- При нажатии «Удалить» появляется запрос на подтверждение
- При подтверждении вызывается `onDeleteChat`, при отмене — нет

### Стек

- [Vitest](https://vitest.dev/) — тестовый фреймворк
- [React Testing Library](https://testing-library.com/react) — компонентные тесты
- [jsdom](https://github.com/jsdom/jsdom) — DOM-окружение