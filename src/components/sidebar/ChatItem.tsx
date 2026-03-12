import React, { useState } from 'react';
import type { Chat } from '../../types';
import styles from './ChatItem.module.css';

interface ChatItemProps {
  chat: Chat;
  isActive: boolean;
  onSelect: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const ChatItem: React.FC<ChatItemProps> = ({ chat, isActive, onSelect, onEdit, onDelete }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={`${styles.item} ${isActive ? styles.active : ''}`}
      onClick={() => onSelect(chat.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className={styles.content}>
        <div className={styles.title}>{chat.title}</div>
        <div className={styles.date}>{chat.lastMessageDate}</div>
      </div>
      {hovered && (
        <div className={styles.actions}>
          <button
            className={styles.actionBtn}
            onClick={(e) => { e.stopPropagation(); onEdit(chat.id); }}
            title="Редактировать"
          >
            ✏️
          </button>
          <button
            className={`${styles.actionBtn} ${styles.deleteBtn}`}
            onClick={(e) => { e.stopPropagation(); onDelete(chat.id); }}
            title="Удалить"
          >
            🗑️
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatItem;