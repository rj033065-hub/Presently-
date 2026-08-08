'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class CommunityErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Community Platform Uncaught Exception:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 sm:p-12 text-center space-y-4 rounded-3xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 backdrop-blur-md max-w-xl mx-auto my-8">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
              {this.props.fallbackTitle || 'Something went wrong loading community content'}
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              {this.state.error?.message || 'A transient rendering error occurred.'}
            </p>
          </div>

          <Button
            onClick={this.handleReset}
            variant="outline"
            className="rounded-full border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            <span>Reload Component</span>
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
