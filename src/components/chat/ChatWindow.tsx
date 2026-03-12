import React from 'react';
import type { Message as MessageType } from '../../types';
import MessageList from './MessageList';
import InputArea from './InputArea';
import styles from './ChatWindow.module.css';

interface ChatWindowProps {
  chatTitle: string;
  messages: MessageType[];
  isTyping?: boolean;
  onSend: (text: string) => void;
  onOpenSettings: () => void;
  onMenuToggle?: () => void;
  showMenuBtn?: boolean;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  chatTitle,
  messages,
  isTyping = true,
  onSend,
  onOpenSettings,
  onMenuToggle,
  showMenuBtn = false,
}) => {
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
        <button className={styles.settingsBtn} onClick={onOpenSettings} title="Настройки">
          ⚙️
        </button>
      </header>
      <MessageList messages={messages} isTyping={isTyping} />
      <InputArea onSend={onSend} />
    </div>
  );
};

export default ChatWindow;