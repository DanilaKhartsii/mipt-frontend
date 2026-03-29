import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';
import type { Message as MessageType } from '../../types';
import styles from './Message.module.css';

interface MessageProps {
  message: MessageType;
  variant: 'user' | 'assistant';
}

const Message: React.FC<MessageProps> = ({ message, variant }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className={`${styles.wrapper} ${styles[variant]}`}>
      {variant === 'assistant' && (
        <div className={styles.avatar}>🤖</div>
      )}
      <div className={styles.messageContainer}>
        <div className={styles.senderName}>
          {variant === 'user' ? 'Вы' : 'GigaChat'}
        </div>
        <div className={`${styles.bubble} ${styles[`bubble_${variant}`]}`}>
          <div className={styles.content}>
            <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
              {message.content}
            </ReactMarkdown>
          </div>
          {variant === 'assistant' && (
            <button
              className={styles.copyBtn}
              onClick={handleCopy}
              title="Копировать"
            >
              {copied ? '✓' : '📋'}
            </button>
          )}
        </div>
        <div className={styles.timestamp}>{message.timestamp}</div>
      </div>
      {variant === 'user' && (
        <div className={`${styles.avatar} ${styles.userAvatar}`}>👤</div>
      )}
    </div>
  );
};

export default Message;