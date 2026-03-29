import React, { useState } from 'react';
import type { Settings } from '../../types';
import { useChatStore } from '../../store/chatStore';
import Toggle from '../ui/Toggle';
import Slider from '../ui/Slider';
import Button from '../ui/Button';
import styles from './SettingsPanel.module.css';

const DEFAULT_SETTINGS: Settings = {
  model: 'GigaChat',
  temperature: 0.7,
  topP: 0.9,
  maxTokens: 1024,
  systemPrompt: 'Ты — полезный ИИ-ассистент GigaChat. Отвечай на русском языке.',
};

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose }) => {
  const { settings, theme, updateSettings, setTheme, logout } = useChatStore();
  const [draft, setDraft] = useState<Settings>(settings);

  // Sync draft when panel opens
  React.useEffect(() => {
    if (isOpen) setDraft(settings);
  }, [isOpen]);

  const update = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    updateSettings(draft);
    onClose();
  };

  const handleReset = () => {
    setDraft(DEFAULT_SETTINGS);
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
              value={draft.model}
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
            <Slider
              label="Temperature"
              value={draft.temperature}
              min={0}
              max={2}
              step={0.1}
              onChange={(v) => update('temperature', v)}
            />
            <Slider
              label="Top-P"
              value={draft.topP}
              min={0}
              max={1}
              step={0.05}
              onChange={(v) => update('topP', v)}
            />
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Max Tokens</label>
              <input
                type="number"
                value={draft.maxTokens}
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
              value={draft.systemPrompt}
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
              checked={theme === 'dark'}
              onChange={(checked) => setTheme(checked ? 'dark' : 'light')}
            />
          </section>

          <section className={styles.section}>
            <Button variant="danger" size="sm" onClick={logout}>
              Выйти из аккаунта
            </Button>
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