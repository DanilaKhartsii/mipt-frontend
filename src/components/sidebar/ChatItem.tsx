import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Chat } from '../../types';
import { useChatStore } from '../../store/chatStore';
import ConfirmModal from '../ui/ConfirmModal';
import styles from './ChatItem.module.css';

interface ChatItemProps {
  chat: Chat;
  isActive: boolean;
  onSelect: (id: string) => void;
}

const ChatItem: React.FC<ChatItemProps> = ({ chat, isActive, onSelect }) => {
  const [hovered, setHovered] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(chat.title);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { renameChat, deleteChat, activeChatId } = useChatStore();

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  const handleEditStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditTitle(chat.title);
    setEditing(true);
  };

  const handleEditSave = () => {
    const trimmed = editTitle.trim();
    if (trimmed && trimmed !== chat.title) {
      renameChat(chat.id, trimmed);
    }
    setEditing(false);
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleEditSave();
    if (e.key === 'Escape') setEditing(false);
  };

  const handleDeleteConfirm = () => {
    setConfirmDelete(false);
    const newActiveId = deleteChat(chat.id);
    if (chat.id === activeChatId) {
      navigate(newActiveId ? `/chat/${newActiveId}` : '/');
    }
  };

  return (
    <>
      <div
        className={`${styles.item} ${isActive ? styles.active : ''}`}
        onClick={() => !editing && onSelect(chat.id)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className={styles.content}>
          {editing ? (
            <input
              ref={inputRef}
              className={styles.editInput}
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleEditSave}
              onKeyDown={handleEditKeyDown}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <div className={styles.title}>{chat.title}</div>
          )}
          <div className={styles.date}>{chat.lastMessageDate}</div>
        </div>
        {hovered && !editing && (
          <div className={styles.actions}>
            <button
              className={styles.actionBtn}
              onClick={handleEditStart}
              title="Переименовать"
            >
              ✏️
            </button>
            <button
              className={`${styles.actionBtn} ${styles.deleteBtn}`}
              onClick={(e) => { e.stopPropagation(); setConfirmDelete(true); }}
              title="Удалить"
            >
              🗑️
            </button>
          </div>
        )}
      </div>

      {confirmDelete && (
        <ConfirmModal
          message={`Удалить чат «${chat.title}»?`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </>
  );
};

export default ChatItem;