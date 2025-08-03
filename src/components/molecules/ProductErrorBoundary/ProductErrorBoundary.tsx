"use client"

import React, { Component, ErrorInfo, ReactNode } from "react"
import { Button } from "@/components/atoms"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
  errorId?: string
}

export class ProductErrorBoundary extends Component<Props, State> {
  private retryCount = 0
  private maxRetries = 3

  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    // Generate unique error ID for tracking
    const errorId = `prod-error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    return {
      hasError: true,
      error,
      errorId
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errorId = this.state.errorId || `prod-error-${Date.now()}`
    
    // Enhanced error logging for production debugging
    const errorDetails = {
      errorId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
      isProduction: process.env.NODE_ENV === 'production',
      isVercel: process.env.VERCEL === '1',
      retryCount: this.retryCount,
      // Hydration-specific checks
      isHydrationError: error.message.includes('hydration') || 
                       error.message.includes('Hydration') ||
                       error.message.includes('server HTML') ||
                       error.message.includes('client-side'),
      // Navigation-specific checks  
      isNavigationError: error.message.includes('navigation') ||
                        error.message.includes('router') ||
                        error.message.includes('redirect'),
      // Component-specific context
      errorBoundaryLocation: 'ProductPage',
      possibleCauses: this.analyzePossibleCauses(error, errorInfo)
    }

    // Log to console for immediate debugging
    console.error('🚨 ProductErrorBoundary caught error:', errorDetails)

    // Log to external service in production (if available)
    if (process.env.NODE_ENV === 'production') {
      this.logToExternalService(errorDetails)
    }

    // Update state with error info
    this.setState({ 
      error, 
      errorInfo,
      errorId: errorDetails.errorId 
    })
  }

  private analyzePossibleCauses(error: Error, errorInfo: ErrorInfo): string[] {
    const causes: string[] = []
    
    if (error.message.includes('hydration')) {
      causes.push('SSR/CSR hydration mismatch')
    }
    
    if (error.message.includes('router') || error.message.includes('navigation')) {
      causes.push('Router/navigation conflict')
    }
    
    if (errorInfo.componentStack.includes('ProductVariants')) {
      causes.push('Product variant selection issue')
    }
    
    if (errorInfo.componentStack.includes('ProductReview')) {
      causes.push('Product review rendering issue')
    }
    
    if (errorInfo.componentStack.includes('VariantSelectionContext')) {
      causes.push('Variant context state issue')
    }
    
    if (error.stack?.includes('useSearchParams') || error.stack?.includes('useRouter')) {
      causes.push('Next.js hook usage conflict')
    }

    return causes
  }

  private async logToExternalService(errorDetails: any) {
    try {
      // In a real app, you'd send to your error tracking service
      // For now, we'll use a simple endpoint or localStorage backup
      if (typeof window !== 'undefined') {
        const existingErrors = JSON.parse(localStorage.getItem('productPageErrors') || '[]')
        existingErrors.push(errorDetails)
        
        // Keep only last 10 errors to prevent localStorage bloat
        if (existingErrors.length > 10) {
          existingErrors.splice(0, existingErrors.length - 10)
        }
        
        localStorage.setItem('productPageErrors', JSON.stringify(existingErrors))
      }
    } catch (logError) {
      console.error('Failed to log error externally:', logError)
    }
  }

  private handleRetry = () => {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++
      console.log(`🔄 Retrying ProductErrorBoundary (attempt ${this.retryCount}/${this.maxRetries})`)
      this.setState({ hasError: false, error: undefined, errorInfo: undefined })
    } else {
      console.log('❌ Max retries reached, showing permanent error state')
    }
  }

  private handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI provided by parent
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">
                Wystąpił błąd
              </h2>
              <p className="text-gray-600">
                Przepraszamy, nie można załadować tej strony produktu.
              </p>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left">
                <h3 className="font-semibold text-red-800 mb-2">Debug Info:</h3>
                <p className="text-sm text-red-700 font-mono break-all">
                  {this.state.error.message}
                </p>
                {this.state.errorId && (
                  <p className="text-xs text-red-600 mt-2">
                    Error ID: {this.state.errorId}
                  </p>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {this.retryCount < this.maxRetries && (
                <Button
                  onClick={this.handleRetry}
                  variant="filled"
                  className="px-6"
                >
                  Spróbuj ponownie ({this.maxRetries - this.retryCount} pozostało)
                </Button>
              )}
              
              <Button
                onClick={this.handleReload}
                variant="text"
                className="px-6"
              >
                Odśwież stronę
              </Button>
            </div>

            <div className="text-sm text-gray-500">
              <p>Jeśli problem się powtarza, spróbuj:</p>
              <ul className="mt-2 space-y-1 text-left">
                <li>• Wyczyść pamięć podręczną przeglądarki</li>
                <li>• Sprawdź połączenie internetowe</li>
                <li>• Spróbuj ponownie za kilka minut</li>
              </ul>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ProductErrorBoundary
