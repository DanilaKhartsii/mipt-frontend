import React, { useState } from 'react';
import Button from '../ui/Button';
import ErrorMessage from '../ui/ErrorMessage';
import styles from './AuthForm.module.css';

type Scope = 'GIGACHAT_API_PERS' | 'GIGACHAT_API_B2B' | 'GIGACHAT_API_CORP';

interface AuthFormProps {
  onAuth: (credentials: string, scope: string) => void;
}

const skipAuth = import.meta.env.VITE_SKIP_AUTH === 'true';

const AuthForm: React.FC<AuthFormProps> = ({ onAuth }) => {
  const [credentials, setCredentials] = useState('');
  const [scope, setScope] = useState<Scope>('GIGACHAT_API_PERS');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!skipAuth && !credentials.trim()) {
      setError('Поле Credentials не должно быть пустым');
      return;
    }
    setError('');
    onAuth(credentials.trim(), scope);
  };

  const scopes: Scope[] = ['GIGACHAT_API_PERS', 'GIGACHAT_API_B2B', 'GIGACHAT_API_CORP'];

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.logo}>🤖</div>
          <h1 className={styles.title}>GigaChat</h1>
          <p className={styles.subtitle}>Войдите для начала работы</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {!skipAuth && (
            <div className={styles.field}>
              <label className={styles.label} htmlFor="credentials">
                Credentials (Base64)
              </label>
              <input
                id="credentials"
                type="password"
                value={credentials}
                onChange={(e) => { setCredentials(e.target.value); setError(''); }}
                placeholder="Введите Base64 строку..."
                className={styles.input}
              />
            </div>
          )}

          {skipAuth && (
            <p className={styles.subtitle} style={{ marginBottom: 8 }}>
              Credentials настроены на сервере
            </p>
          )}

          {error && <ErrorMessage message={error} />}

          {!skipAuth && (
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
                    />
                    <span className={styles.radioText}>{s}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <Button type="submit" variant="primary" size="lg" className={styles.submitBtn}>
            Войти
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AuthForm;