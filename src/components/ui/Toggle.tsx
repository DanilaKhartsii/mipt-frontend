import React from 'react';
import styles from './Toggle.module.css';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}

const Toggle: React.FC<ToggleProps> = ({ checked, onChange, label }) => {
  return (
    <label className={styles.toggleLabel}>
      {label && <span className={styles.labelText}>{label}</span>}
      <div className={styles.toggleWrapper}>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className={styles.input}
        />
        <div className={`${styles.track} ${checked ? styles.checked : ''}`}>
          <div className={styles.thumb} />
        </div>
      </div>
    </label>
  );
};

export default Toggle;