import { lazy, Suspense, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './styles/theme.css';

const AuthPage = lazy(() => import('./pages/AuthPage'));
const ChatPage = lazy(() => import('./pages/ChatPage'));

const PageLoader = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--color-text-secondary)' }}>
    Загрузка...
  </div>
);

const skipAuth = import.meta.env.VITE_SKIP_AUTH === 'true';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(skipAuth);
  const [credentials, setCredentials] = useState('');
  const [scope, setScope] = useState('GIGACHAT_API_PERS');

  const handleAuth = (creds: string, sc: string) => {
    setCredentials(creds);
    setScope(sc);
    setIsAuthenticated(true);
  };

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route
          path="/"
          element={isAuthenticated ? <Navigate to="/chat" replace /> : <AuthPage onAuth={handleAuth} />}
        />
        <Route
          path="/chat/:id?"
          element={
            !isAuthenticated
              ? <Navigate to="/" replace />
              : <ChatPage credentials={credentials} scope={scope} />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}