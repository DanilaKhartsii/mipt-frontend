import React from 'react';
import Button from './Button';
import styles from './ConfirmModal.module.css';

interface ConfirmModalProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ message, onConfirm, onCancel }) => (
  <div className={styles.overlay} onClick={onCancel}>
    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
      <p className={styles.message}>{message}</p>
      <div className={styles.actions}>
        <Button variant="secondary" size="sm" onClick={onCancel}>
          Отмена
        </Button>
        <Button variant="danger" size="sm" onClick={onConfirm}>
          Удалить
        </Button>
      </div>
    </div>
  </div>
);

export default ConfirmModal;