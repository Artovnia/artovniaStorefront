// src/components/organisms/ProductDetails/MeasurementsErrorBoundary.tsx
'use client';

import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  locale?: string;
}

interface State {
  hasError: boolean;
}

export class MeasurementsErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.warn('Measurements component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="m-0 py-4 text-center text-gray-500 text-sm">
          {this.props.locale === 'pl' 
            ? 'Wymiary nie są obecnie dostępne' 
            : 'Measurements are currently unavailable'}
        </div>
      );
    }

    return this.props.children;
  }
}