import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChatStore } from '../../store/chatStore';
import Sidebar from '../sidebar/Sidebar';
import ChatWindow from '../chat/ChatWindow';
import SettingsPanel from '../settings/SettingsPanel';
import styles from './AppLayout.module.css';

const AppLayout: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  const {
    chats,
    activeChatId,
    messages,
    isLoading,
    theme,
    setActiveChat,
    setTheme,
    sendMessage,
    stopGeneration,
    createChat,
  } = useChatStore();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Sync URL param → store active chat
  useEffect(() => {
    if (id) {
      if (chats.some((c) => c.id === id)) {
        setActiveChat(id);
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [id, chats]);

  const activeChat = chats.find((c) => c.id === activeChatId);
  const activeMessages = activeChatId ? (messages[activeChatId] ?? []) : [];

  const handleSend = (text: string) => {
    let chatId = activeChatId;
    if (!chatId) {
      chatId = createChat();
      navigate(`/chat/${chatId}`);
    }
    sendMessage(chatId, text);
  };

  return (
    <div className={styles.layout}>
      {sidebarOpen && (
        <div className={styles.mobileOverlay} onClick={() => setSidebarOpen(false)} />
      )}

      <div className={`${styles.sidebarWrapper} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <Sidebar onSelectChat={() => setSidebarOpen(false)} />
      </div>

      <main className={styles.main}>
        <ChatWindow
          chatTitle={activeChat?.title ?? 'Выберите или создайте чат'}
          messages={activeMessages}
          isTyping={isLoading}
          onSend={handleSend}
          onStop={stopGeneration}
          onOpenSettings={() => setSettingsOpen(true)}
          onMenuToggle={() => setSidebarOpen((prev) => !prev)}
          showMenuBtn={true}
          theme={theme}
          onThemeChange={setTheme}
        />
      </main>

      <SettingsPanel
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
};

export default AppLayout;