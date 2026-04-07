import AuthForm from '../components/auth/AuthForm';

interface AuthPageProps {
  onAuth: (credentials: string, scope: string) => void;
}

export default function AuthPage({ onAuth }: AuthPageProps) {
  return <AuthForm onAuth={onAuth} />;
}