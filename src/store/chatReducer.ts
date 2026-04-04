import type { Chat, Message } from '../types';

export interface ChatState {
  chats: Chat[];
  activeChatId: string | null;
  chatMessages: Record<string, Message[]>;
}

export type ChatAction =
  | { type: 'ADD_MESSAGE'; payload: { chatId: string; message: Message } }
  | { type: 'CREATE_CHAT'; payload: { chat: Chat } }
  | { type: 'DELETE_CHAT'; payload: { id: string } }
  | { type: 'RENAME_CHAT'; payload: { id: string; title: string } }
  | { type: 'SET_ACTIVE_CHAT'; payload: { id: string | null } };

export const initialState: ChatState = {
  chats: [],
  activeChatId: null,
  chatMessages: {},
};

export function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'ADD_MESSAGE':
      return {
        ...state,
        chatMessages: {
          ...state.chatMessages,
          [action.payload.chatId]: [
            ...(state.chatMessages[action.payload.chatId] ?? []),
            action.payload.message,
          ],
        },
      };

    case 'CREATE_CHAT':
      return {
        ...state,
        chats: [action.payload.chat, ...state.chats],
        activeChatId: action.payload.chat.id,
      };

    case 'DELETE_CHAT': {
      const remaining = state.chats.filter((c) => c.id !== action.payload.id);
      const newActiveChatId =
        state.activeChatId === action.payload.id
          ? (remaining[0]?.id ?? null)
          : state.activeChatId;
      const newMessages = { ...state.chatMessages };
      delete newMessages[action.payload.id];
      return {
        ...state,
        chats: remaining,
        activeChatId: newActiveChatId,
        chatMessages: newMessages,
      };
    }

    case 'RENAME_CHAT':
      return {
        ...state,
        chats: state.chats.map((c) =>
          c.id === action.payload.id ? { ...c, title: action.payload.title } : c
        ),
      };

    case 'SET_ACTIVE_CHAT':
      return {
        ...state,
        activeChatId: action.payload.id,
      };

    default:
      return state;
  }
}