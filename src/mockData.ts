import type { Chat, Message } from './types';

export const mockChats: Chat[] = [
  { id: '1', title: 'Помощь с React компонентами', lastMessage: 'Как использовать useEffect?', lastMessageDate: '12 мар', isActive: true },
  { id: '2', title: 'Объяснение алгоритмов сортировки', lastMessage: 'Быстрая сортировка работает...', lastMessageDate: '11 мар' },
  { id: '3', title: 'Написание резюме', lastMessage: 'Добавьте раздел о навыках...', lastMessageDate: '10 мар' },
  { id: '4', title: 'Изучение TypeScript', lastMessage: 'Generics позволяют...', lastMessageDate: '9 мар' },
  { id: '5', title: 'Рецепт борща', lastMessage: 'Сначала обжарьте свёклу...', lastMessageDate: '8 мар' },
  { id: '6', title: 'Планирование путешествия', lastMessage: 'Лучшее время для посещения...', lastMessageDate: '7 мар' },
];

export const mockMessages: Message[] = [
  { id: '1', role: 'user', content: 'Привет! Можешь объяснить, как работает **useEffect** в React?', timestamp: '14:20' },
  {
    id: '2', role: 'assistant', content: `Конечно! **useEffect** — это хук React, который позволяет выполнять побочные эффекты в функциональных компонентах.

## Основное использование

\`\`\`javascript
useEffect(() => {
  // Код эффекта
  return () => {
    // Функция очистки (опционально)
  };
}, [dependencies]); // Массив зависимостей
\`\`\`

## Варианты использования

- **Без массива зависимостей** — запускается после каждого рендера
- **С пустым массивом \`[]\`** — запускается только один раз (аналог componentDidMount)
- **С зависимостями** — запускается при изменении зависимостей`, timestamp: '14:21'
  },
  { id: '3', role: 'user', content: 'А как правильно делать запросы к API внутри useEffect?', timestamp: '14:22' },
  {
    id: '4', role: 'assistant', content: `Для запросов к API рекомендую такой паттерн:

\`\`\`typescript
useEffect(() => {
  let isMounted = true;

  const fetchData = async () => {
    try {
      const response = await fetch('/api/data');
      const data = await response.json();
      if (isMounted) {
        setData(data);
      }
    } catch (error) {
      if (isMounted) {
        setError(error);
      }
    }
  };

  fetchData();

  return () => {
    isMounted = false;
  };
}, []);
\`\`\`

Флаг \`isMounted\` предотвращает *утечки памяти* при размонтировании компонента.`, timestamp: '14:23'
  },
  { id: '5', role: 'user', content: 'Спасибо! А что такое кастомные хуки?', timestamp: '14:25' },
  {
    id: '6', role: 'assistant', content: `Кастомные хуки — это функции, которые:

1. Начинаются с **use** (например, \`useFetch\`, \`useLocalStorage\`)
2. Могут использовать другие хуки внутри
3. Позволяют *переиспользовать логику* между компонентами

Пример простого кастомного хука:

\`\`\`typescript
function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetch(url)
      .then(r => r.json())
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [url]);

  return { data, loading, error };
}
\`\`\``, timestamp: '14:26'
  },
];