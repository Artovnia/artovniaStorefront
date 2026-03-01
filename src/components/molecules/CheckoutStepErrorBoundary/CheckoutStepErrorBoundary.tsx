"use client"

import { Component, ErrorInfo, ReactNode } from "react"
import { Link } from "@/i18n/routing"
import { reportClientBoundaryError } from "@/lib/telemetry/client-error-reporter"

type CheckoutStep = "address" | "delivery" | "payment" | "review"

type CheckoutStepErrorBoundaryProps = {
  step: CheckoutStep
  cartId?: string
  pathname?: string
  locale?: string
  children: ReactNode
}

type CheckoutStepErrorBoundaryState = {
  hasError: boolean
}

export default class CheckoutStepErrorBoundary extends Component<
  CheckoutStepErrorBoundaryProps,
  CheckoutStepErrorBoundaryState
> {
  constructor(props: CheckoutStepErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    void reportClientBoundaryError({
      boundary: "checkout-step",
      segment: "checkout",
      step: this.props.step,
      cartId: this.props.cartId,
      pathname: this.props.pathname,
      locale: this.props.locale,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack ?? undefined,
    })
  }

  private handleRetry = () => {
    this.setState({ hasError: false })
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children
    }

    return (
      <section className="rounded-lg border border-red-200 bg-red-50 p-5" role="alert" aria-live="polite">
        <h3 className="mb-2 text-lg font-semibold text-red-900">Problem z krokiem checkout</h3>
        <p className="mb-4 text-sm text-red-800">
          Nie udało się poprawnie załadować sekcji {this.props.step}. Możesz spróbować ponownie lub wrócić do koszyka.
        </p>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={this.handleRetry}
            className="rounded-md bg-red-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-800"
          >
            Spróbuj ponownie
          </button>
          <Link
            href="/cart"
            className="rounded-md border border-red-300 bg-white px-4 py-2 text-center text-sm font-medium text-red-800 transition-colors hover:bg-red-100"
          >
            Wróć do koszyka
          </Link>
        </div>
      </section>
    )
  }
}
