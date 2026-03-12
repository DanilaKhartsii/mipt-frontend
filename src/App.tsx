import React, { useState, useEffect } from 'react';
import AppLayout from './components/layout/AppLayout';
import AuthForm from './components/auth/AuthForm';
import type { Chat } from './types';
import { mockChats } from './mockData';
import './styles/theme.css';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [chats, setChats] = useState<Chat[]>(mockChats);
  const [activeChatId, setActiveChatId] = useState<string | null>(mockChats[0]?.id ?? null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const handleAuth = () => {
    setIsAuthenticated(true);
  };

  const handleNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: 'Новый чат',
      lastMessage: '',
      lastMessageDate: 'сегодня',
    };
    setChats((prev) => [newChat, ...prev]);
    setActiveChatId(newChat.id);
  };

  const handleDeleteChat = (id: string) => {
    setChats((prev) => prev.filter((c) => c.id !== id));
    if (activeChatId === id) {
      setActiveChatId(chats.find((c) => c.id !== id)?.id ?? null);
    }
  };

  const handleEditChat = (id: string) => {
    const newTitle = prompt('Введите новое название чата:');
    if (newTitle?.trim()) {
      setChats((prev) => prev.map((c) => c.id === id ? { ...c, title: newTitle.trim() } : c));
    }
  };

  if (!isAuthenticated) {
    return <AuthForm onAuth={handleAuth} />;
  }

  return (
    <AppLayout
      chats={chats}
      activeChatId={activeChatId}
      onSelectChat={setActiveChatId}
      onNewChat={handleNewChat}
      onEditChat={handleEditChat}
      onDeleteChat={handleDeleteChat}
      theme={theme}
      onThemeChange={setTheme}
    />
  );
};

export default App;