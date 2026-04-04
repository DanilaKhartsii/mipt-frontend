import { describe, it, expect } from 'vitest';
import { chatReducer, initialState } from './chatReducer';
import type { ChatState } from './chatReducer';
import type { Chat, Message } from '../types';

const makeChat = (id: string, title = 'Чат'): Chat => ({
  id,
  title,
  lastMessage: '',
  lastMessageDate: '',
});

const makeMessage = (id: string, role: 'user' | 'assistant' = 'user'): Message => ({
  id,
  role,
  content: 'Текст сообщения',
  timestamp: '12:00',
});

describe('chatReducer', () => {
  describe('ADD_MESSAGE', () => {
    it('увеличивает массив messages на 1', () => {
      const state: ChatState = {
        ...initialState,
        chats: [makeChat('1')],
        activeChatId: '1',
        chatMessages: { '1': [] },
      };
      const next = chatReducer(state, {
        type: 'ADD_MESSAGE',
        payload: { chatId: '1', message: makeMessage('m1') },
      });
      expect(next.chatMessages['1']).toHaveLength(1);
    });

    it('добавляет новое сообщение в конец массива', () => {
      const existing = makeMessage('m1');
      const state: ChatState = {
        ...initialState,
        chats: [makeChat('1')],
        activeChatId: '1',
        chatMessages: { '1': [existing] },
      };
      const newMsg = makeMessage('m2');
      const next = chatReducer(state, {
        type: 'ADD_MESSAGE',
        payload: { chatId: '1', message: newMsg },
      });
      expect(next.chatMessages['1'].at(-1)).toEqual(newMsg);
    });

    it('не изменяет сообщения других чатов', () => {
      const state: ChatState = {
        ...initialState,
        chats: [makeChat('1'), makeChat('2')],
        activeChatId: '1',
        chatMessages: { '1': [], '2': [makeMessage('other')] },
      };
      const next = chatReducer(state, {
        type: 'ADD_MESSAGE',
        payload: { chatId: '1', message: makeMessage('m1') },
      });
      expect(next.chatMessages['2']).toHaveLength(1);
    });
  });

  describe('CREATE_CHAT', () => {
    it('добавляет новый чат в массив chats', () => {
      const chat = makeChat('new', 'Новый чат');
      const next = chatReducer(initialState, { type: 'CREATE_CHAT', payload: { chat } });
      expect(next.chats.some((c) => c.id === 'new')).toBe(true);
    });

    it('новый чат появляется в начале списка', () => {
      const state: ChatState = {
        ...initialState,
        chats: [makeChat('old')],
        activeChatId: 'old',
      };
      const chat = makeChat('new');
      const next = chatReducer(state, { type: 'CREATE_CHAT', payload: { chat } });
      expect(next.chats[0].id).toBe('new');
    });

    it('устанавливает activeChatId на id нового чата', () => {
      const chat = makeChat('new');
      const next = chatReducer(initialState, { type: 'CREATE_CHAT', payload: { chat } });
      expect(next.activeChatId).toBe('new');
    });
  });

  describe('DELETE_CHAT', () => {
    it('удаляет чат из массива', () => {
      const state: ChatState = {
        ...initialState,
        chats: [makeChat('1'), makeChat('2')],
        activeChatId: '2',
      };
      const next = chatReducer(state, { type: 'DELETE_CHAT', payload: { id: '1' } });
      expect(next.chats.find((c) => c.id === '1')).toBeUndefined();
    });

    it('сбрасывает activeChatId при удалении активного чата', () => {
      const state: ChatState = {
        ...initialState,
        chats: [makeChat('1'), makeChat('2')],
        activeChatId: '1',
      };
      const next = chatReducer(state, { type: 'DELETE_CHAT', payload: { id: '1' } });
      expect(next.activeChatId).not.toBe('1');
    });

    it('activeChatId становится null если удалили единственный чат', () => {
      const state: ChatState = {
        ...initialState,
        chats: [makeChat('1')],
        activeChatId: '1',
      };
      const next = chatReducer(state, { type: 'DELETE_CHAT', payload: { id: '1' } });
      expect(next.activeChatId).toBeNull();
    });

    it('не меняет activeChatId при удалении неактивного чата', () => {
      const state: ChatState = {
        ...initialState,
        chats: [makeChat('1'), makeChat('2')],
        activeChatId: '2',
      };
      const next = chatReducer(state, { type: 'DELETE_CHAT', payload: { id: '1' } });
      expect(next.activeChatId).toBe('2');
    });
  });

  describe('RENAME_CHAT', () => {
    it('обновляет название чата по id', () => {
      const state: ChatState = {
        ...initialState,
        chats: [makeChat('1', 'Старое название')],
        activeChatId: '1',
      };
      const next = chatReducer(state, {
        type: 'RENAME_CHAT',
        payload: { id: '1', title: 'Новое название' },
      });
      expect(next.chats.find((c) => c.id === '1')?.title).toBe('Новое название');
    });

    it('не изменяет другие чаты при переименовании', () => {
      const state: ChatState = {
        ...initialState,
        chats: [makeChat('1', 'Первый'), makeChat('2', 'Второй')],
        activeChatId: '1',
      };
      const next = chatReducer(state, {
        type: 'RENAME_CHAT',
        payload: { id: '1', title: 'Переименован' },
      });
      expect(next.chats.find((c) => c.id === '2')?.title).toBe('Второй');
    });
  });
});