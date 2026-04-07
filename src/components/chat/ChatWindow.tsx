import React from 'react';
import type { Message as MessageType } from '../../types';
import MessageList from './MessageList';
import InputArea from './InputArea';
import ErrorBoundary from '../ErrorBoundary';
import ErrorMessage from '../ui/ErrorMessage';
import styles from './ChatWindow.module.css';

interface ChatWindowProps {
  chatTitle: string;
  messages: MessageType[];
  isTyping?: boolean;
  apiError?: string | null;
  onSend: (text: string) => void;
  onStop?: () => void;
  onOpenSettings: () => void;
  onMenuToggle?: () => void;
  showMenuBtn?: boolean;
  theme?: 'light' | 'dark';
  onThemeChange?: (theme: 'light' | 'dark') => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  chatTitle,
  messages,
  isTyping = false,
  apiError,
  onSend,
  onStop,
  onOpenSettings,
  onMenuToggle,
  showMenuBtn = false,
  theme = 'light',
  onThemeChange,
}) => {
  const handleThemeToggle = () => {
    onThemeChange?.(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className={styles.window}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          {showMenuBtn && (
            <button className={styles.menuBtn} onClick={onMenuToggle} title="Меню">
              ☰
            </button>
          )}
          <h2 className={styles.title}>{chatTitle}</h2>
        </div>
        <div className={styles.headerRight}>
          <button
            className={styles.themeBtn}
            onClick={handleThemeToggle}
            title={theme === 'light' ? 'Тёмная тема' : 'Светлая тема'}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <button className={styles.settingsBtn} onClick={onOpenSettings} title="Настройки">
            ⚙️
          </button>
        </div>
      </header>

      <ErrorBoundary>
        <MessageList messages={messages} isTyping={isTyping} />
      </ErrorBoundary>

      {apiError && (
        <div className={styles.errorContainer}>
          <ErrorMessage message={apiError} />
        </div>
      )}

      <InputArea onSend={onSend} isGenerating={isTyping} onStop={onStop} />
    </div>
  );
};

export default ChatWindow;