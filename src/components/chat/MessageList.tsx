import React, { useEffect, useRef } from 'react';
import type { Message as MessageType } from '../../types';
import Message from './Message';
import TypingIndicator from './TypingIndicator';
import styles from './MessageList.module.css';

interface MessageListProps {
  messages: MessageType[];
  isTyping?: boolean;
}

const EmptyState: React.FC = () => (
  <div className={styles.emptyState}>
    <div className={styles.emptyIcon}>💬</div>
    <h3 className={styles.emptyTitle}>Начните новый диалог</h3>
    <p className={styles.emptyText}>Задайте вопрос GigaChat, и он ответит вам</p>
  </div>
);

const MessageList: React.FC<MessageListProps> = ({ messages, isTyping = false }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (messages.length === 0) {
    return (
      <div className={styles.container}>
        <EmptyState />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.messages}>
        {messages.map((msg) => (
          <Message key={msg.id} message={msg} variant={msg.role} />
        ))}
        {isTyping && <TypingIndicator isVisible />}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default MessageList;