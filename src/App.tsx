import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import AuthForm from './components/auth/AuthForm';
import { useChatStore } from './store/chatStore';
import './styles/theme.css';

const HomeRoute: React.FC = () => {
  const { chats, activeChatId } = useChatStore();
  const targetId = activeChatId ?? chats[0]?.id;

  if (targetId) {
    return <Navigate to={`/chat/${targetId}`} replace />;
  }

  // No chats yet — show layout so user can create one
  return <AppLayout />;
};

const App: React.FC = () => {
  const { token, theme } = useChatStore();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  if (!token) {
    return <AuthForm />;
  }

  return (
    <Routes>
      <Route path="/" element={<HomeRoute />} />
      <Route path="/chat/:id" element={<AppLayout />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;