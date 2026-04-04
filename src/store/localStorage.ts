import type { ChatState } from './chatReducer';

const STORAGE_KEY = 'gigachat_state';

export function loadState(): Partial<ChatState> | undefined {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (!serialized) return undefined;
    return JSON.parse(serialized) as Partial<ChatState>;
  } catch {
    return undefined;
  }
}

export function saveState(state: ChatState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore write errors (e.g. storage quota exceeded)
  }
}