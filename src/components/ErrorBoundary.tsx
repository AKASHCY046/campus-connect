import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Unhandled UI error:', error, info);
  }

  handleReset = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-[70vh] items-center justify-center px-4">
          <div className="max-w-md text-center">
            <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-destructive/10 text-destructive">
              <AlertTriangle className="h-7 w-7" />
            </div>
            <h1 className="mb-2 text-2xl">Something went wrong</h1>
            <p className="mb-6 text-sm text-muted-foreground">
              This page hit an unexpected error. You can try again or head back to your dashboard.
            </p>
            <pre className="mb-6 max-h-32 overflow-auto rounded-lg bg-muted p-3 text-left text-xs text-muted-foreground">
              {this.state.error.message}
            </pre>
            <div className="flex justify-center gap-3">
              <Button variant="outline" onClick={this.handleReset}>
                Try again
              </Button>
              <Button onClick={() => (window.location.href = '/dashboard')}>Go to dashboard</Button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
