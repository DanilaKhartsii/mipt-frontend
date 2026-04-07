import React, { useState, useEffect } from 'react';
import type { Settings } from '../../types';
import Toggle from '../ui/Toggle';
import Slider from '../ui/Slider';
import Button from '../ui/Button';
import styles from './SettingsPanel.module.css';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentSettings: Settings;
  onSave: (settings: Settings) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose, currentSettings, onSave }) => {
  const [local, setLocal] = useState<Settings>(currentSettings);

  // Sync local state when panel opens
  useEffect(() => {
    if (isOpen) setLocal(currentSettings);
  }, [isOpen, currentSettings]);

  const update = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setLocal((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onSave(local);
    onClose();
  };

  const handleReset = () => {
    setLocal(currentSettings);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
        <div className={styles.drawerHeader}>
          <h2 className={styles.drawerTitle}>Настройки</h2>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.content}>
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Модель</h3>
            <select
              value={local.model}
              onChange={(e) => update('model', e.target.value as Settings['model'])}
              className={styles.select}
            >
              <option value="GigaChat">GigaChat</option>
              <option value="GigaChat-Plus">GigaChat-Plus</option>
              <option value="GigaChat-Pro">GigaChat-Pro</option>
              <option value="GigaChat-Max">GigaChat-Max</option>
            </select>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Параметры генерации</h3>
            <Slider label="Temperature" value={local.temperature} min={0} max={2} step={0.1} onChange={(v) => update('temperature', v)} />
            <Slider label="Top-P" value={local.topP} min={0} max={1} step={0.05} onChange={(v) => update('topP', v)} />
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Max Tokens</label>
              <input
                type="number"
                value={local.maxTokens}
                min={1}
                max={32768}
                onChange={(e) => update('maxTokens', parseInt(e.target.value) || 1)}
                className={styles.numberInput}
              />
            </div>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>System Prompt</h3>
            <textarea
              value={local.systemPrompt}
              onChange={(e) => update('systemPrompt', e.target.value)}
              className={styles.systemPrompt}
              rows={4}
              placeholder="Введите системный промпт..."
            />
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Интерфейс</h3>
            <Toggle
              label="Тёмная тема"
              checked={local.theme === 'dark'}
              onChange={(checked) => update('theme', checked ? 'dark' : 'light')}
            />
          </section>
        </div>

        <div className={styles.footer}>
          <Button variant="secondary" onClick={handleReset}>Сбросить</Button>
          <Button variant="primary" onClick={handleSave}>Сохранить</Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;