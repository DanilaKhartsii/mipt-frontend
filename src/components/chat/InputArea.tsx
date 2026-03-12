import React, { useState, useRef, useEffect } from 'react';
import styles from './InputArea.module.css';

interface InputAreaProps {
  onSend: (text: string) => void;
  isGenerating?: boolean;
  onStop?: () => void;
}

const InputArea: React.FC<InputAreaProps> = ({ onSend, isGenerating = false, onStop }) => {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const lineHeight = 22;
      const maxHeight = lineHeight * 5 + 24;
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, maxHeight) + 'px';
    }
  }, [text]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text.trim());
    setText('');
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <button className={styles.attachBtn} title="Прикрепить изображение" type="button">
          📎
        </button>
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Введите сообщение... (Enter — отправить, Shift+Enter — новая строка)"
          className={styles.textarea}
          rows={1}
        />
        {isGenerating ? (
          <button
            className={`${styles.sendBtn} ${styles.stopBtn}`}
            onClick={onStop}
            type="button"
            title="Остановить"
          >
            ⏹
          </button>
        ) : (
          <button
            className={styles.sendBtn}
            onClick={handleSend}
            disabled={!text.trim()}
            type="button"
            title="Отправить"
          >
            ➤
          </button>
        )}
      </div>
      <p className={styles.hint}>Enter — отправить · Shift+Enter — новая строка</p>
    </div>
  );
};

export default InputArea;