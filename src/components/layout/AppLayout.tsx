import React, { useState } from 'react';
import type { Chat, Message } from '../../types';
import Sidebar from '../sidebar/Sidebar';
import ChatWindow from '../chat/ChatWindow';
import SettingsPanel from '../settings/SettingsPanel';
import { mockMessages } from '../../mockData';
import styles from './AppLayout.module.css';

interface AppLayoutProps {
  chats: Chat[];
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onEditChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
  theme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
}

const AppLayout: React.FC<AppLayoutProps> = ({
  chats,
  activeChatId,
  onSelectChat,
  onNewChat,
  onEditChat,
  onDeleteChat,
  theme,
  onThemeChange,
}) => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Record<string, Message[]>>({ '1': mockMessages });
  const [isLoading, setIsLoading] = useState(false);

  const activeChat = chats.find((c) => c.id === activeChatId);
  const activeMessages = activeChatId ? (chatMessages[activeChatId] ?? []) : [];

  const handleSend = (text: string) => {
    if (!activeChatId) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
    };
    setChatMessages((prev) => ({
      ...prev,
      [activeChatId]: [...(prev[activeChatId] ?? []), userMsg],
    }));
    setIsLoading(true);
    setTimeout(() => {
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Это моковый ответ ассистента. Здесь будет настоящий ответ от GigaChat.',
        timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages((prev) => ({
        ...prev,
        [activeChatId]: [...(prev[activeChatId] ?? []), assistantMsg],
      }));
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className={styles.layout}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className={styles.mobileOverlay} onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={`${styles.sidebarWrapper} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <Sidebar
          chats={chats}
          activeChatId={activeChatId}
          onSelectChat={(id) => { onSelectChat(id); setSidebarOpen(false); }}
          onNewChat={() => { onNewChat(); setSidebarOpen(false); }}
          onEditChat={onEditChat}
          onDeleteChat={onDeleteChat}
        />
      </div>

      {/* Main chat area */}
      <main className={styles.main}>
        <ChatWindow
          chatTitle={activeChat?.title ?? 'Новый чат'}
          messages={activeMessages}
          isTyping={isLoading}
          onSend={handleSend}
          onOpenSettings={() => setSettingsOpen(true)}
          onMenuToggle={() => setSidebarOpen((prev) => !prev)}
          showMenuBtn={true}
        />
      </main>

      <SettingsPanel
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onThemeChange={onThemeChange}
        currentTheme={theme}
      />
    </div>
  );
};

export default AppLayout;