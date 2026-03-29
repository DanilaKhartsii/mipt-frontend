import React from 'react';
import type { Chat } from '../../types';
import ChatItem from './ChatItem';
import styles from './ChatList.module.css';

interface ChatListProps {
  chats: Chat[];
  activeChatId: string | null;
  onSelect: (id: string) => void;
}

const ChatList: React.FC<ChatListProps> = ({ chats, activeChatId, onSelect }) => {
  if (chats.length === 0) {
    return <div className={styles.empty}>Чаты не найдены</div>;
  }

  return (
    <div className={styles.list}>
      {chats.map((chat) => (
        <ChatItem
          key={chat.id}
          chat={chat}
          isActive={chat.id === activeChatId}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
};

export default ChatList;