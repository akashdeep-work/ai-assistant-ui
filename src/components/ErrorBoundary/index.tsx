import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
    message: '',
  };

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      message: error.message,
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('App crashed:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-slate-100">
          <section className="max-w-lg rounded-3xl border border-red-400/20 bg-red-500/10 p-8 shadow-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-300">
              Application error
            </p>

            <h1 className="mt-4 text-2xl font-bold">Something went wrong.</h1>

            <p className="mt-3 text-sm text-slate-300">
              {this.state.message || 'Please refresh the app and try again.'}
            </p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 rounded-2xl bg-red-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-400"
            >
              Reload app
            </button>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}