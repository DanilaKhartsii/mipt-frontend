import { useReducer, useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import { chatReducer, initialState } from '../store/chatReducer';
import { loadState, saveState } from '../store/localStorage';
import { mockChats } from '../mockData';
import type { Chat, Message, Settings } from '../types';

const DEFAULT_SETTINGS: Settings = {
  model: 'GigaChat',
  temperature: 0.7,
  topP: 0.9,
  maxTokens: 1024,
  systemPrompt: 'Ты — полезный ИИ-ассистент GigaChat. Отвечай на русском языке.',
  theme: 'light',
};

interface ChatPageProps {
  credentials: string;
  scope: string;
}

export default function ChatPage({ credentials, scope }: ChatPageProps) {
  const { id: urlChatId } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  const savedState = loadState();
  const [state, dispatch] = useReducer(chatReducer, {
    ...initialState,
    chats: savedState?.chats ?? mockChats,
    activeChatId: savedState?.activeChatId ?? mockChats[0]?.id ?? null,
    chatMessages: savedState?.chatMessages ?? {},
  });

  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Persist state to localStorage
  useEffect(() => { saveState(state); }, [state]);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme);
  }, [settings.theme]);

  // Sync URL → state on mount (deep link support)
  useEffect(() => {
    if (urlChatId && urlChatId !== state.activeChatId) {
      const exists = state.chats.some((c) => c.id === urlChatId);
      if (exists) dispatch({ type: 'SET_ACTIVE_CHAT', payload: { id: urlChatId } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync state → URL
  useEffect(() => {
    if (state.activeChatId && state.activeChatId !== urlChatId) {
      navigate(`/chat/${state.activeChatId}`, { replace: true });
    }
  }, [state.activeChatId, navigate, urlChatId]);

  const handleNewChat = useCallback(() => {
    const chat: Chat = {
      id: Date.now().toString(),
      title: 'Новый чат',
      lastMessage: '',
      lastMessageDate: new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
    };
    dispatch({ type: 'CREATE_CHAT', payload: { chat } });
  }, []);

  const handleDeleteChat = useCallback((id: string) => {
    dispatch({ type: 'DELETE_CHAT', payload: { id } });
  }, []);

  const handleEditChat = useCallback((id: string) => {
    const newTitle = prompt('Введите новое название чата:');
    if (newTitle?.trim()) {
      dispatch({ type: 'RENAME_CHAT', payload: { id, title: newTitle.trim() } });
    }
  }, []);

  const handleSelectChat = useCallback((id: string) => {
    dispatch({ type: 'SET_ACTIVE_CHAT', payload: { id } });
  }, []);

  const handleStop = useCallback(() => {
    abortRef.current?.abort();
    setIsGenerating(false);
  }, []);

  const handleSend = useCallback(async (text: string) => {
    const { activeChatId, chatMessages } = state;
    if (!activeChatId) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
    };

    dispatch({ type: 'ADD_MESSAGE', payload: { chatId: activeChatId, message: userMsg } });
    setIsGenerating(true);
    setApiError(null);

    const controller = new AbortController();
    abortRef.current = controller;

    const history = (chatMessages[activeChatId] ?? []).map((m) => ({
      role: m.role,
      content: m.content,
    }));
    history.push({ role: 'user', content: text });

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history,
          model: settings.model,
          temperature: settings.temperature,
          topP: settings.topP,
          maxTokens: settings.maxTokens,
          systemPrompt: settings.systemPrompt,
          credentials,
          scope,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const err = await res.json() as { error?: string };
        throw new Error(err.error ?? `HTTP ${res.status}`);
      }

      const data = await res.json() as { content: string };
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.content,
        timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      };
      dispatch({ type: 'ADD_MESSAGE', payload: { chatId: activeChatId, message: assistantMsg } });
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setApiError((err as Error).message);
      }
    } finally {
      setIsGenerating(false);
    }
  // state.activeChatId and state.chatMessages are read inside, but we only depend on
  // activeChatId for the guard; chatMessages reference is stable via dispatch.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.activeChatId, state.chatMessages, settings, credentials, scope]);

  const activeMessages = state.activeChatId ? (state.chatMessages[state.activeChatId] ?? []) : [];

  return (
    <AppLayout
      chats={state.chats}
      activeChatId={state.activeChatId}
      messages={activeMessages}
      isGenerating={isGenerating}
      apiError={apiError}
      onSend={handleSend}
      onStop={handleStop}
      onSelectChat={handleSelectChat}
      onNewChat={handleNewChat}
      onEditChat={handleEditChat}
      onDeleteChat={handleDeleteChat}
      settings={settings}
      onSettingsSave={setSettings}
    />
  );
}