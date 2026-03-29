export interface Chat {
  id: string;
  title: string;
  lastMessage: string;
  lastMessageDate: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface Settings {
  model: 'GigaChat' | 'GigaChat-Plus' | 'GigaChat-Pro' | 'GigaChat-Max';
  temperature: number;
  topP: number;
  maxTokens: number;
  systemPrompt: string;
}

export interface ChatState {
  // Auth
  token: string | null;
  tokenExpiry: number | null;
  credentials: string | null;
  scope: string | null;
  // Chats
  chats: Chat[];
  activeChatId: string | null;
  messages: Record<string, Message[]>;
  // Settings & UI
  settings: Settings;
  theme: 'light' | 'dark';
  isLoading: boolean;
  error: string | null;
}

export type ChatAction =
  | { type: 'SET_TOKEN'; token: string; expiresAt: number }
  | { type: 'LOGOUT' }
  | { type: 'CREATE_CHAT'; chat: Chat }
  | { type: 'DELETE_CHAT'; id: string }
  | { type: 'RENAME_CHAT'; id: string; title: string }
  | { type: 'SET_ACTIVE_CHAT'; id: string | null }
  | { type: 'ADD_MESSAGE'; chatId: string; message: Message }
  | { type: 'UPDATE_MESSAGE'; chatId: string; messageId: string; content: string }
  | { type: 'UPDATE_SETTINGS'; settings: Partial<Settings> }
  | { type: 'SET_THEME'; theme: 'light' | 'dark' }
  | { type: 'SET_LOADING'; isLoading: boolean }
  | { type: 'SET_ERROR'; error: string | null };