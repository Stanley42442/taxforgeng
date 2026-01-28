import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home, Bug } from "lucide-react";
import { Button } from "@/components/ui/button";
import logger from "@/lib/logger";
import { sanitizeErrorForDisplay } from "@/lib/errorUtils";
import { reportError } from "@/lib/errorTracking";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
    
    // Report error to tracking system
    reportError(error, errorInfo.componentStack ?? undefined);
    
    this.props.onError?.(error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  private handleGoHome = () => {
    window.location.href = "/";
  };

  private handleReportIssue = () => {
    const subject = encodeURIComponent("Bug Report: Application Error");
    // Sanitize error details for production - don't expose full stack traces
    const sanitizedError = sanitizeErrorForDisplay(this.state.error);
    const body = encodeURIComponent(
      `Error: ${sanitizedError}\n\nPlease describe what you were doing when this error occurred:\n\n`
    );
    window.open(`mailto:support@taxforgeng.com?subject=${subject}&body=${body}`);
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return <ErrorFallback 
        error={this.state.error}
        onRetry={this.handleRetry}
        onGoHome={this.handleGoHome}
        onReportIssue={this.handleReportIssue}
      />;
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error: Error | null;
  onRetry: () => void;
  onGoHome: () => void;
  onReportIssue: () => void;
}

export const ErrorFallback = ({ error, onRetry, onGoHome, onReportIssue }: ErrorFallbackProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-6">
          <div className="h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-10 w-10 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Something went wrong
          </h1>
          <p className="text-muted-foreground">
            We're sorry, but something unexpected happened. Please try again or contact support if the problem persists.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-destructive/5 border border-destructive/20 text-left">
            <p className="text-sm font-mono text-destructive break-all">
              {error.message}
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={onRetry} variant="default" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
          <Button onClick={onGoHome} variant="outline" className="gap-2">
            <Home className="h-4 w-4" />
            Go Home
          </Button>
          <Button onClick={onReportIssue} variant="ghost" className="gap-2">
            <Bug className="h-4 w-4" />
            Report Issue
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ErrorBoundary;
