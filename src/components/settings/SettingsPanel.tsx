import React, { useState } from 'react';
import type { Settings } from '../../types';
import Toggle from '../ui/Toggle';
import Slider from '../ui/Slider';
import Button from '../ui/Button';
import styles from './SettingsPanel.module.css';

const defaultSettings: Settings = {
  model: 'GigaChat',
  temperature: 0.7,
  topP: 0.9,
  maxTokens: 1024,
  systemPrompt: 'Ты — полезный ИИ-ассистент GigaChat. Отвечай на русском языке.',
  theme: 'light',
};

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onThemeChange: (theme: 'light' | 'dark') => void;
  currentTheme: 'light' | 'dark';
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose, onThemeChange, currentTheme }) => {
  const [settings, setSettings] = useState<Settings>({ ...defaultSettings, theme: currentTheme });

  const update = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onThemeChange(settings.theme);
    onClose();
  };

  const handleReset = () => {
    setSettings({ ...defaultSettings, theme: currentTheme });
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
              value={settings.model}
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
              value={settings.temperature}
              min={0}
              max={2}
              step={0.1}
              onChange={(v) => update('temperature', v)}
            />
            <Slider
              label="Top-P"
              value={settings.topP}
              min={0}
              max={1}
              step={0.05}
              onChange={(v) => update('topP', v)}
            />
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Max Tokens</label>
              <input
                type="number"
                value={settings.maxTokens}
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
              value={settings.systemPrompt}
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
              checked={settings.theme === 'dark'}
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