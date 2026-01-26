import { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, WifiOff, AlertCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  isChunkError: boolean;
}

/**
 * Error boundary specifically for lazy-loaded routes.
 * Handles chunk load failures (network issues) with a user-friendly recovery UI.
 */
export class LazyRouteErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, isChunkError: false };

  static getDerivedStateFromError(error: Error): State {
    // Check if it's a chunk load error (network issue with lazy loading)
    const isChunkError = 
      error.message.includes('Loading chunk') || 
      error.message.includes('Failed to fetch') ||
      error.message.includes('dynamically imported module') ||
      error.name === 'ChunkLoadError';
    
    return { hasError: true, isChunkError };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error for debugging (only in development)
    if (import.meta.env.DEV) {
      console.error('[LazyRouteErrorBoundary] Error caught:', error);
      console.error('[LazyRouteErrorBoundary] Error info:', errorInfo);
    }
  }

  handleReload = () => {
    // Clear the error state and reload
    this.setState({ hasError: false, isChunkError: false });
    window.location.reload();
  };

  handleRetry = () => {
    // Clear the error state to trigger re-render (which will retry lazy loading)
    this.setState({ hasError: false, isChunkError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-4 text-center">
          {this.state.isChunkError ? (
            <>
              <div className="h-16 w-16 rounded-full bg-warning/10 flex items-center justify-center mb-4">
                <WifiOff className="h-8 w-8 text-warning" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Connection Issue</h2>
              <p className="text-muted-foreground mb-6 max-w-md">
                We couldn't load this page. Please check your internet connection and try again.
              </p>
              <div className="flex gap-3">
                <Button onClick={this.handleRetry} variant="outline">
                  Try Again
                </Button>
                <Button onClick={this.handleReload}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reload Page
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Something Went Wrong</h2>
              <p className="text-muted-foreground mb-6 max-w-md">
                We encountered an error loading this page. Please try again.
              </p>
              <Button onClick={this.handleReload}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Reload Page
              </Button>
            </>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default LazyRouteErrorBoundary;
