import { Component, type ReactNode, type ErrorInfo } from 'react';
import ErrorMessage from './ui/ErrorMessage';
import styles from './ErrorBoundary.module.css';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info.componentStack);
  }

  handleRetry = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className={styles.container}>
          <ErrorMessage message={`Ошибка рендера: ${this.state.error.message}`} />
          <button className={styles.retryBtn} onClick={this.handleRetry}>
            Повторить
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;