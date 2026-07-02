import { Component, type ReactNode } from "react";
import { RefreshCw, AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error("[ErrorBoundary] Caught render error:", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="w-7 h-7 text-destructive" strokeWidth={1.5} />
          </div>
          <div>
            <p className="font-semibold text-foreground mb-1">Something went wrong</p>
            <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
              {this.state.error.message || "An unexpected error occurred in this section."}
            </p>
          </div>
          <button
            onClick={() => this.setState({ error: null })}
            className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-primary text-white text-sm font-medium shadow-sm hover:opacity-90 transition-opacity"
          >
            <RefreshCw className="w-3.5 h-3.5" strokeWidth={2} />
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
