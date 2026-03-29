import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChatStore } from '../../store/chatStore';
import Button from '../ui/Button';
import SearchInput from './SearchInput';
import ChatList from './ChatList';
import styles from './Sidebar.module.css';

interface SidebarProps {
  onSelectChat?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onSelectChat }) => {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { chats, activeChatId, createChat } = useChatStore();

  const filteredChats = chats.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(search.toLowerCase())
  );

  const handleNewChat = () => {
    const id = createChat();
    navigate(`/chat/${id}`);
    onSelectChat?.();
  };

  const handleSelectChat = (id: string) => {
    navigate(`/chat/${id}`);
    onSelectChat?.();
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <Button onClick={handleNewChat} variant="primary" size="md" className={styles.newChatBtn}>
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
          onSelect={handleSelectChat}
        />
      </div>
    </aside>
  );
};

export default Sidebar;