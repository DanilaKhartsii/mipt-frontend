import React, { useState } from 'react';
import type { Chat } from '../../types';
import Button from '../ui/Button';
import SearchInput from './SearchInput';
import ChatList from './ChatList';
import styles from './Sidebar.module.css';

interface SidebarProps {
  chats: Chat[];
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onEditChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  chats,
  activeChatId,
  onSelectChat,
  onNewChat,
  onEditChat,
  onDeleteChat,
}) => {
  const [search, setSearch] = useState('');

  const filteredChats = chats.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <Button onClick={onNewChat} variant="primary" size="md" className={styles.newChatBtn}>
          + Новый чат
        </Button>
      </div>
      <div className={styles.search}>
        <SearchInput value={search} onChange={setSearch} />
      </div>
      <div className={styles.listContainer}>
        <p className={styles.sectionLabel}>Чаты</p>
        <ChatList
          chats={filteredChats}
          activeChatId={activeChatId}
          onSelect={onSelectChat}
          onEdit={onEditChat}
          onDelete={onDeleteChat}
        />
      </div>
    </aside>
  );
};

export default Sidebar;