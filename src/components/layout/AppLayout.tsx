import React, { lazy, Suspense, useState, useCallback } from 'react';
import type { Chat, Message, Settings } from '../../types';
import ChatWindow from '../chat/ChatWindow';
import styles from './AppLayout.module.css';

const Sidebar = lazy(() => import('../sidebar/Sidebar'));
const SettingsPanel = lazy(() => import('../settings/SettingsPanel'));

interface AppLayoutProps {
  chats: Chat[];
  activeChatId: string | null;
  messages: Message[];
  isGenerating: boolean;
  apiError: string | null;
  onSend: (text: string) => void;
  onStop: () => void;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onEditChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
  settings: Settings;
  onSettingsSave: (settings: Settings) => void;
}

const SidebarFallback = () => <div className={styles.sidebarSkeleton} />;
const PanelFallback = () => null;

const AppLayout: React.FC<AppLayoutProps> = ({
  chats,
  activeChatId,
  messages,
  isGenerating,
  apiError,
  onSend,
  onStop,
  onSelectChat,
  onNewChat,
  onEditChat,
  onDeleteChat,
  settings,
  onSettingsSave,
}) => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activeChat = chats.find((c) => c.id === activeChatId);

  const handleSelectChat = useCallback((id: string) => {
    onSelectChat(id);
    setSidebarOpen(false);
  }, [onSelectChat]);

  const handleNewChat = useCallback(() => {
    onNewChat();
    setSidebarOpen(false);
  }, [onNewChat]);

  const handleOpenSettings = useCallback(() => setSettingsOpen(true), []);
  const handleCloseSettings = useCallback(() => setSettingsOpen(false), []);
  const handleMenuToggle = useCallback(() => setSidebarOpen((v) => !v), []);

  return (
    <div className={styles.layout}>
      {sidebarOpen && (
        <div className={styles.mobileOverlay} onClick={() => setSidebarOpen(false)} />
      )}

      <div className={`${styles.sidebarWrapper} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <Suspense fallback={<SidebarFallback />}>
          <Sidebar
            chats={chats}
            activeChatId={activeChatId}
            onSelectChat={handleSelectChat}
            onNewChat={handleNewChat}
            onEditChat={onEditChat}
            onDeleteChat={onDeleteChat}
          />
        </Suspense>
      </div>

      <main className={styles.main}>
        <ChatWindow
          chatTitle={activeChat?.title ?? 'Новый чат'}
          messages={messages}
          isTyping={isGenerating}
          apiError={apiError}
          onSend={onSend}
          onStop={onStop}
          onOpenSettings={handleOpenSettings}
          onMenuToggle={handleMenuToggle}
          showMenuBtn={true}
          theme={settings.theme}
          onThemeChange={(theme) => onSettingsSave({ ...settings, theme })}
        />
      </main>

      <Suspense fallback={<PanelFallback />}>
        <SettingsPanel
          isOpen={settingsOpen}
          onClose={handleCloseSettings}
          currentSettings={settings}
          onSave={onSettingsSave}
        />
      </Suspense>
    </div>
  );
};

export default AppLayout;