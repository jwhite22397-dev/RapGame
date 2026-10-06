import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Error boundary for the whole app
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Game error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="screen-root flex items-center justify-center bg-dark-950 p-4">
          <div className="max-w-md text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Something went wrong</h1>
            <p className="text-dark-400 mb-6">
              The game encountered an error. Your save data should be safe.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-white text-dark-950 rounded-xl font-semibold"
            >
              Reload Game
            </button>
            {this.state.error && (
              <details className="mt-6 text-left">
                <summary className="text-dark-500 cursor-pointer">Technical details</summary>
                <pre className="mt-2 p-4 bg-dark-900 rounded-lg text-xs text-red-400 overflow-auto">
                  {this.state.error.message}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
