import { describe, it, expect, beforeEach, vi } from 'vitest';
import { loadState, saveState } from './localStorage';
import type { ChatState } from './chatReducer';

const baseState: ChatState = {
  chats: [{ id: '1', title: 'Тест', lastMessage: '', lastMessageDate: '' }],
  activeChatId: '1',
  chatMessages: { '1': [{ id: 'm1', role: 'user', content: 'Привет', timestamp: '12:00' }] },
};

describe('localStorage persistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('saveState сохраняет данные в localStorage', () => {
    saveState(baseState);
    expect(localStorage.getItem('gigachat_state')).not.toBeNull();
  });

  it('loadState корректно восстанавливает данные', () => {
    saveState(baseState);
    const loaded = loadState();
    expect(loaded?.chats).toHaveLength(1);
    expect(loaded?.activeChatId).toBe('1');
    expect(loaded?.chatMessages?.['1']).toHaveLength(1);
  });

  it('loadState возвращает undefined когда localStorage пуст', () => {
    expect(loadState()).toBeUndefined();
  });

  it('loadState не падает при невалидном JSON', () => {
    localStorage.setItem('gigachat_state', 'INVALID_JSON{{{');
    expect(() => loadState()).not.toThrow();
    expect(loadState()).toBeUndefined();
  });

  it('saveState вызывает localStorage.setItem с корректным ключом', () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
    saveState(baseState);
    expect(setItemSpy).toHaveBeenCalledWith('gigachat_state', expect.any(String));
    setItemSpy.mockRestore();
  });

  it('saveState не падает при ошибке записи (quota exceeded)', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    expect(() => saveState(baseState)).not.toThrow();
    vi.restoreAllMocks();
  });
});