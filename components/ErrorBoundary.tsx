import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-zinc-900 flex items-center justify-center p-8">
          <div className="bg-zinc-800 rounded-lg p-8 max-w-lg w-full border border-zinc-700">
            <div className="text-center mb-6">
              <div className="text-red-400 text-4xl mb-4">⚠️</div>
              <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
              <p className="text-zinc-400 text-sm">
                The app encountered an error and couldn't render properly.
              </p>
            </div>
            
            {this.state.error && (
              <div className="bg-zinc-900 rounded p-4 mb-4">
                <h3 className="text-red-400 text-sm font-mono mb-2">Error:</h3>
                <p className="text-zinc-300 text-xs font-mono break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-zinc-700 hover:bg-zinc-600 text-white rounded px-4 py-2 text-sm transition-colors"
            >
              Reload App
            </button>
            
            <div className="mt-4 text-xs text-zinc-500 text-center">
              Check the browser console for detailed error information.
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}