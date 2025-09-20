'use client';

import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>;
}

class HydrationErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log hydration errors but don't crash the app
    if (error.message.includes('Hydration failed') || 
        error.message.includes('hydration')) {
      console.warn('🔄 Hydration mismatch detected (likely browser extension):', error.message);
      return;
    }
    
    // Log other errors normally
    console.error('💥 Component Error:', error, errorInfo);
  }

  override render() {
    if (this.state.hasError) {
      // Check if it's a hydration error
      if (this.state.error?.message.includes('Hydration failed') || 
          this.state.error?.message.includes('hydration')) {
        // For hydration errors, just render children normally
        return this.props.children;
      }

      // For other errors, show fallback
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return (
          <FallbackComponent 
            error={this.state.error!} 
            reset={() => this.setState({ hasError: false })} 
          />
        );
      }

      return (
        <div className="error-boundary">
          <h2>🚨 Something went wrong</h2>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.error?.toString()}
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

export default HydrationErrorBoundary;