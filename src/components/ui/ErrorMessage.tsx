import React from 'react';
import styles from './ErrorMessage.module.css';

interface ErrorMessageProps {
  message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  return (
    <div className={styles.error} role="alert">
      <span className={styles.icon}>⚠</span>
      <span className={styles.text}>{message}</span>
    </div>
  );
};

export default ErrorMessage;