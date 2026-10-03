import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#F7F9FC] p-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 mb-4">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold text-[#101828] mb-2">
            An unexpected application error occurred
          </h2>
          <p className="text-xs text-[#475467] max-w-md mb-6 leading-relaxed">
            The workspace encountered an unexpected client issue. You can try refreshing the page or reloading your current session.
          </p>
          {this.state.error && (
            <div className="mt-4 mb-2 max-w-xl text-left bg-rose-50 border border-rose-200 rounded-xl p-3 text-[11px] font-mono text-rose-800 overflow-x-auto">
              <p className="font-bold text-rose-900 mb-1">Diagnostic Detail:</p>
              {this.state.error.message}
            </div>
          )}
          <div className="flex items-center gap-3 mt-4">
            <Button
              variant="primary"
              size="sm"
              onClick={() => window.location.reload()}
              className="gap-2"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Reload Workspace</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.href = '/dashboard';
              }}
            >
              Return to Dashboard
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
