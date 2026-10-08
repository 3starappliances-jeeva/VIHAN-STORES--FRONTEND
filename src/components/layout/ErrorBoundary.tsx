import { Component, type ErrorInfo, type ReactNode } from 'react';
import { ErrorState } from '@/components/ui';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}
interface State {
  error?: Error;
}

/** Catches render errors inside a section so one broken widget never blanks the page. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = {};
  static getDerivedStateFromError(error: Error): State {
    return { error };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) console.error('[ErrorBoundary]', error, info.componentStack);
  }
  render() {
    if (this.state.error) return this.props.fallback ?? <ErrorState compact description={this.state.error.message} onRetry={() => this.setState({ error: undefined })} />;
    return this.props.children;
  }
}
