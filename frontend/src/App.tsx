import {
  Component,
  type ErrorInfo,
  type ReactNode,
} from "react";

import { AuthProvider } from "./context/AuthContext";
import AppRouter from "./routes/AppRouter";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

class AppErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = {
    hasError: false,
    message: "",
  };

  static getDerivedStateFromError(
    error: unknown
  ): ErrorBoundaryState {
    return {
      hasError: true,
      message:
        error instanceof Error
          ? error.message
          : "An unexpected application error occurred.",
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Application render error:", error);
    console.error("Component stack:", info.componentStack);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
          <section className="w-full max-w-lg rounded-3xl border border-border bg-card p-8 text-center shadow-2xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
              <span className="text-2xl font-bold">!</span>
            </div>

            <h1 className="mt-5 text-2xl font-bold">
              Something went wrong
            </h1>

            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              The application could not render this page. Reloading usually
              resolves a stale deployment or browser chunk issue.
            </p>

            <button
              type="button"
              onClick={this.handleReload}
              className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
            >
              Reload application
            </button>

            {this.state.message && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-xs font-semibold text-muted-foreground">
                  Technical details
                </summary>
                <pre className="mt-3 overflow-auto rounded-xl bg-muted p-4 text-xs text-muted-foreground">
                  {this.state.message}
                </pre>
              </details>
            )}
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}

function App() {
  return (
    <AppErrorBoundary>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </AppErrorBoundary>
  );
}

export default App;
