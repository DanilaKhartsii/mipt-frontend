import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Chat, Message, Settings, ChatState } from '../types';
import { getAccessToken, sendChatMessage } from '../api/gigachat';

const DEFAULT_SETTINGS: Settings = {
  model: 'GigaChat',
  temperature: 0.7,
  topP: 0.9,
  maxTokens: 1024,
  systemPrompt: 'Ты — полезный ИИ-ассистент GigaChat. Отвечай на русском языке.',
};

interface ChatStore extends ChatState {
  abortController: AbortController | null;

  // Auth
  authenticate: (credentials: string, scope: string) => Promise<void>;
  logout: () => void;
  refreshTokenIfNeeded: () => Promise<void>;

  // Chats
  createChat: () => string;
  deleteChat: (id: string) => string | null; // returns new activeChatId
  renameChat: (id: string, title: string) => void;
  setActiveChat: (id: string | null) => void;

  // Messages
  sendMessage: (chatId: string, content: string) => Promise<void>;
  stopGeneration: () => void;

  // Settings & theme
  updateSettings: (patch: Partial<Settings>) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  clearError: () => void;
}

function now(): string {
  return new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      // ── Initial state ──────────────────────────────────────────────────
      token: null,
      tokenExpiry: null,
      credentials: null,
      scope: null,
      chats: [],
      activeChatId: null,
      messages: {},
      settings: DEFAULT_SETTINGS,
      theme: 'light',
      isLoading: false,
      error: null,
      abortController: null,

      // ── Auth ───────────────────────────────────────────────────────────
      authenticate: async (credentials, scope) => {
        set({ isLoading: true, error: null });
        try {
          const { token, expiresAt } = await getAccessToken(credentials, scope);
          set({ token, tokenExpiry: expiresAt, credentials, scope, isLoading: false });
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Ошибка авторизации';
          set({ error: msg, isLoading: false });
          throw err;
        }
      },

      logout: () =>
        set({
          token: null,
          tokenExpiry: null,
          credentials: null,
          scope: null,
          chats: [],
          messages: {},
          activeChatId: null,
          isLoading: false,
          error: null,
        }),

      refreshTokenIfNeeded: async () => {
        const { token, tokenExpiry, credentials, scope } = get();
        if (!credentials || !scope) return;
        if (token && tokenExpiry && Date.now() < tokenExpiry - 60_000) return;
        try {
          const result = await getAccessToken(credentials, scope);
          set({ token: result.token, tokenExpiry: result.expiresAt });
        } catch {
          set({ token: null, tokenExpiry: null });
        }
      },

      // ── Chats ──────────────────────────────────────────────────────────
      createChat: () => {
        const id = Date.now().toString();
        const newChat: Chat = {
          id,
          title: 'Новый чат',
          lastMessage: '',
          lastMessageDate: 'сегодня',
        };
        set((s) => ({ chats: [newChat, ...s.chats] }));
        return id;
      },

      deleteChat: (id) => {
        const { chats } = get();
        const remaining = chats.filter((c) => c.id !== id);
        const newActive = remaining[0]?.id ?? null;
        set((s) => {
          const newMessages = { ...s.messages };
          delete newMessages[id];
          return { chats: remaining, messages: newMessages, activeChatId: newActive };
        });
        return newActive;
      },

      renameChat: (id, title) =>
        set((s) => ({
          chats: s.chats.map((c) => (c.id === id ? { ...c, title } : c)),
        })),

      setActiveChat: (id) => set({ activeChatId: id }),

      // ── Messages ───────────────────────────────────────────────────────
      sendMessage: async (chatId, content) => {
        const state = get();
        if (!state.token) return;

        const prevMessages = state.messages[chatId] ?? [];

        // Auto-generate chat title from first user message
        if (prevMessages.length === 0) {
          const title = content.trim().slice(0, 40) || 'Новый чат';
          set((s) => ({
            chats: s.chats.map((c) => (c.id === chatId ? { ...c, title } : c)),
          }));
        }

        const userMsg: Message = {
          id: Date.now().toString(),
          role: 'user',
          content,
          timestamp: now(),
        };

        set((s) => ({
          messages: {
            ...s.messages,
            [chatId]: [...(s.messages[chatId] ?? []), userMsg],
          },
          isLoading: true,
          error: null,
        }));

        // Placeholder assistant message for streaming
        const assistantMsgId = `${Date.now()}_assistant`;
        const assistantMsg: Message = {
          id: assistantMsgId,
          role: 'assistant',
          content: '',
          timestamp: now(),
        };

        set((s) => ({
          messages: {
            ...s.messages,
            [chatId]: [...(s.messages[chatId] ?? []), assistantMsg],
          },
        }));

        const controller = new AbortController();
        set({ abortController: controller });

        try {
          await get().refreshTokenIfNeeded();
          const { token, settings } = get();

          const apiMessages = [
            ...(settings.systemPrompt
              ? [{ role: 'system' as const, content: settings.systemPrompt }]
              : []),
            ...prevMessages.map((m) => ({
              role: m.role as 'user' | 'assistant',
              content: m.content,
            })),
            { role: 'user' as const, content },
          ];

          await sendChatMessage({
            token: token!,
            messages: apiMessages,
            model: settings.model,
            temperature: settings.temperature,
            topP: settings.topP,
            maxTokens: settings.maxTokens,
            signal: controller.signal,
            onChunk: (chunk) => {
              set((s) => ({
                messages: {
                  ...s.messages,
                  [chatId]: (s.messages[chatId] ?? []).map((m) =>
                    m.id === assistantMsgId ? { ...m, content: m.content + chunk } : m
                  ),
                },
              }));
            },
          });

          // Update chat preview with final assistant content
          const finalContent =
            get().messages[chatId]?.find((m) => m.id === assistantMsgId)?.content ?? '';
          set((s) => ({
            chats: s.chats.map((c) =>
              c.id === chatId
                ? { ...c, lastMessage: finalContent.slice(0, 60), lastMessageDate: 'сегодня' }
                : c
            ),
          }));
        } catch (err: unknown) {
          if (err instanceof Error && err.name !== 'AbortError') {
            set({ error: err.message || 'Ошибка при отправке сообщения' });
            // Remove empty assistant placeholder on error
            set((s) => ({
              messages: {
                ...s.messages,
                [chatId]: (s.messages[chatId] ?? []).filter(
                  (m) => !(m.id === assistantMsgId && m.content === '')
                ),
              },
            }));
          }
        } finally {
          set({ isLoading: false, abortController: null });
        }
      },

      stopGeneration: () => {
        get().abortController?.abort();
        set({ abortController: null, isLoading: false });
      },

      // ── Settings & theme ──────────────────────────────────────────────
      updateSettings: (patch) =>
        set((s) => ({ settings: { ...s.settings, ...patch } })),

      setTheme: (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        set({ theme });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'gigachat-store',
      // Don't persist transient state
      partialize: (state) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { abortController, isLoading, error, ...rest } = state;
        return rest;
      },
      // Handle corrupted localStorage data
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('Failed to rehydrate store:', error);
        }
        if (state) {
          // Re-apply theme after rehydration
          document.documentElement.setAttribute('data-theme', state.theme);
        }
      },
    }
  )
);