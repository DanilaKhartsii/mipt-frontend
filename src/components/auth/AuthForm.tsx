import React, { useState } from 'react';
import Button from '../ui/Button';
import ErrorMessage from '../ui/ErrorMessage';
import { useChatStore } from '../../store/chatStore';
import styles from './AuthForm.module.css';

type Scope = 'GIGACHAT_API_PERS' | 'GIGACHAT_API_B2B' | 'GIGACHAT_API_CORP';

const scopes: Scope[] = ['GIGACHAT_API_PERS', 'GIGACHAT_API_B2B', 'GIGACHAT_API_CORP'];

const AuthForm: React.FC = () => {
  const [credentials, setCredentials] = useState('');
  const [scope, setScope] = useState<Scope>('GIGACHAT_API_PERS');
  const { authenticate, isLoading, error, clearError } = useChatStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!credentials.trim()) return;
    try {
      await authenticate(credentials.trim(), scope);
    } catch {
      // error is set in the store
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.logo}>🤖</div>
          <h1 className={styles.title}>GigaChat</h1>
          <p className={styles.subtitle}>Войдите для начала работы</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="credentials">
              Credentials (Base64)
            </label>
            <input
              id="credentials"
              type="password"
              value={credentials}
              onChange={(e) => { setCredentials(e.target.value); clearError(); }}
              placeholder="Введите Base64 строку..."
              className={styles.input}
              disabled={isLoading}
            />
          </div>

          {error && <ErrorMessage message={error} />}

          <div className={styles.field}>
            <label className={styles.label}>Scope</label>
            <div className={styles.radioGroup}>
              {scopes.map((s) => (
                <label key={s} className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="scope"
                    value={s}
                    checked={scope === s}
                    onChange={() => setScope(s)}
                    className={styles.radio}
                    disabled={isLoading}
                  />
                  <span className={styles.radioText}>{s}</span>
                </label>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className={styles.submitBtn}
            disabled={isLoading || !credentials.trim()}
          >
            {isLoading ? 'Вход...' : 'Войти'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AuthForm;