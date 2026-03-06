"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "@/i18n/routing";
import { useSearchParams, useParams } from "next/navigation";
import { useCart } from "@/components/context/CartContext";
import { removeCartId } from "@/lib/data/cookies";
import { placeOrder } from "@/lib/data/cart";

const StripeReturnPageContent: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const locale = (params.locale as string) || "pl";
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dots, setDots] = useState(".");

  const { clearCart, refreshCart, cart } = useCart();

  // Animated dots for loading text
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "." : prev + "."));
    }, 600);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const processStripeReturn = async () => {
      try {
        const paymentIntent = searchParams.get("payment_intent");
        const paymentIntentClientSecret = searchParams.get(
          "payment_intent_client_secret"
        );
        const redirectStatus = searchParams.get("redirect_status");
        const sessionId = searchParams.get("session_id");
        const cartId = searchParams.get("cart_id");
        const status = searchParams.get("status");

        if (!cartId) {
          throw new Error("Missing cart_id parameter");
        }

        const finalStatus = redirectStatus || status;

        if (finalStatus === "succeeded" || finalStatus === "success") {
          let result;
          let lastError: Error | null = null;
          const maxRetries = 3;

          for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
              result = await placeOrder(cartId, true);
              break;
            } catch (placeOrderError: any) {
              lastError = placeOrderError;

              const errorType = placeOrderError.errorType;
              const statusCode = placeOrderError.statusCode;

              if (errorType === "out_of_stock" || statusCode === 409) {
                console.error(
                  "Out of stock error, not retrying:",
                  placeOrderError.message
                );
                setError(
                  locale === "pl"
                    ? `Niestety, niektóre produkty z Twojego koszyka są już niedostępne w wybranej ilości. Płatność nie została pobrana. Zaktualizuj koszyk i spróbuj ponownie.`
                    : `Unfortunately, some items in your cart are no longer available in the requested quantity. Your payment was not charged. Please update your cart and try again.`
                );
                setIsProcessing(false);
                return;
              }

              if (errorType === "payment_failed" || statusCode === 402) {
                console.error(
                  "Payment error, not retrying:",
                  placeOrderError.message
                );
                result = undefined;
                break;
              }

              if (attempt < maxRetries) {
                const delay = 1000 * Math.pow(2, attempt - 1);
                await new Promise((resolve) => setTimeout(resolve, delay));
                continue;
              }

              result = undefined;
            }
          }

          if (!result && lastError && cartId) {
            try {
              const publishableKey =
                process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY;

              let realPaymentIntentId = paymentIntent;

              try {
                if (sessionId) {
                  const sessionResponse = await fetch(
                    `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/stripe/session-payment-intent?session_id=${sessionId}`,
                    {
                      headers: {
                        "x-publishable-api-key": publishableKey || "",
                      },
                    }
                  );

                  if (sessionResponse.ok) {
                    const sessionData = await sessionResponse.json();
                    if (sessionData.paymentIntentId) {
                      realPaymentIntentId = sessionData.paymentIntentId;
                    }
                  }
                } else {
                  const paymentIntentResponse = await fetch(
                    `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/carts/${cartId}/stripe-payment-intent`,
                    {
                      headers: {
                        "x-publishable-api-key": publishableKey || "",
                      },
                    }
                  );

                  if (paymentIntentResponse.ok) {
                    const paymentIntentData =
                      await paymentIntentResponse.json();

                    if (paymentIntentData.paymentIntentId) {
                      realPaymentIntentId = paymentIntentData.paymentIntentId;
                    }

                    if (paymentIntentData.isPlaceholder) {
                      console.warn(
                        "Skipping refund for placeholder payment:",
                        realPaymentIntentId
                      );
                      setError(
                        locale === "pl"
                          ? `🧪 TRYB TESTOWY: Zamówienie nie powiodło się (symulacja). W trybie produkcyjnym płatność zostałaby automatycznie zwrócona. ID płatności: ${realPaymentIntentId}`
                          : `🧪 TEST MODE: Order failed (simulated). In production, payment would be automatically refunded. Payment ID: ${realPaymentIntentId}`
                      );

                      setTimeout(() => {
                        router.push("/");
                      }, 5000);

                      return;
                    }
                  }
                }
              } catch (paymentIntentError) {
                console.error(
                  "Failed to retrieve real payment intent:",
                  paymentIntentError
                );
              }

              const isRealStripePayment =
                realPaymentIntentId?.startsWith("pi_");

              if (!isRealStripePayment) {
                console.warn(
                  "Skipping refund for non-Stripe payment:",
                  realPaymentIntentId
                );
                setError(
                  locale === "pl"
                    ? `🧪 TRYB TESTOWY: Zamówienie nie powiodło się (symulacja). W trybie produkcyjnym płatność zostałaby automatycznie zwrócona. ID płatności: ${realPaymentIntentId}`
                    : `🧪 TEST MODE: Order failed (simulated). In production, payment would be automatically refunded. Payment ID: ${realPaymentIntentId}`
                );

                setTimeout(() => {
                  router.push("/");
                }, 5000);

                return;
              }

              const refundResponse = await fetch(
                `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/stripe/refund-safeguard`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    "x-publishable-api-key": publishableKey || "",
                  },
                  body: JSON.stringify({
                    cartId,
                    paymentIntentId: realPaymentIntentId,
                    reason: `Order completion failed after ${maxRetries} attempts: ${lastError.message}`,
                  }),
                }
              );

              if (refundResponse.ok) {
                const refundData = await refundResponse.json();

                if (refundData.testMode) {
                  setError(
                    locale === "pl"
                      ? `🧪 TRYB TESTOWY: Zamówienie nie powiodło się (symulacja). W trybie produkcyjnym płatność zostałaby automatycznie zwrócona. ID płatności: ${paymentIntent}`
                      : `🧪 TEST MODE: Order failed (simulated). In production, payment would be automatically refunded. Payment ID: ${paymentIntent}`
                  );
                } else {
                  setError(
                    locale === "pl"
                      ? `Płatność została automatycznie zwrócona. Kwota zostanie zwrócona na Twoje konto w ciągu 5-10 dni roboczych. Przepraszamy za niedogodności. Numer płatności: ${paymentIntent}`
                      : `Payment has been automatically refunded. The amount will be returned to your account within 5-10 business days. We apologize for the inconvenience. Payment ID: ${paymentIntent}`
                  );
                }

                setTimeout(() => {
                  router.push("/");
                }, 5000);

                return;
              }
            } catch (refundError) {
              // Refund safeguard failed
            }

            setError(
              locale === "pl"
                ? `Płatność zakończona sukcesem, ale finalizacja zamówienia nie powiodła się. Skontaktuj się z obsługą klienta podając numer płatności: ${paymentIntent}`
                : `Payment succeeded but order completion failed. Please contact support with payment ID: ${paymentIntent}`
            );

            return;
          }

          try {
            if (result) {
              clearCart();

              if (typeof window !== "undefined") {
                try {
                  localStorage.removeItem("_medusa_cart_id");
                  localStorage.removeItem("medusa_cart_id");
                } catch (error) {
                  // Ignore
                }
              }
            } else {
              try {
                await removeCartId();
                clearCart();
              } catch (error) {
                // Ignore
              }
            }

            let orderId = null;

            if (result) {
              orderId =
                result.id ||
                result.order?.id ||
                result.data?.id ||
                result.order_set?.id ||
                (result.type === "order" && result.order?.id) ||
                (result.type === "order_set" && result.order_set?.id);
            }

            if (orderId) {
              router.push(`/order/${orderId}/confirmed`);
              return;
            } else {
              setError(
                locale === "pl"
                  ? "Zamówienie zostało utworzone, ale nie znaleziono ID zamówienia. Sprawdź historię zamówień."
                  : "Order was created but order ID not found. Please check your order history."
              );
            }
          } catch (error: any) {
            setError(
              locale === "pl"
                ? `Płatność zakończona sukcesem, ale finalizacja zamówienia nie powiodła się. Skontaktuj się z obsługą klienta podając numer płatności: ${paymentIntent || "nieznany"}`
                : `Payment succeeded but order completion failed. Please contact support with payment ID: ${paymentIntent || "unknown"}`
            );
          }
        } else if (finalStatus === "failed") {
          setError(
            locale === "pl"
              ? "Płatność nie powiodła się. Spróbuj ponownie."
              : "Payment failed. Please try again."
          );

          setTimeout(() => {
            router.push(`/checkout?step=payment&cart_id=${cartId}`);
          }, 3000);
        } else {
          setError(
            locale === "pl"
              ? "Nieznany status płatności. Skontaktuj się z obsługą klienta."
              : "Unknown payment status. Please contact support."
          );

          setTimeout(() => {
            router.push(`/checkout?step=payment&cart_id=${cartId}`);
          }, 3000);
        }
      } catch (error: any) {
        console.error("Error processing Stripe return:", error);
        setError(
          error.message ||
            (locale === "pl"
              ? "Wystąpił błąd podczas przetwarzania płatności"
              : "An error occurred while processing your payment")
        );

        setTimeout(() => {
          const cartId = searchParams.get("cart_id");
          if (cartId) {
            router.push(`/checkout?step=payment&cart_id=${cartId}`);
          } else {
            router.push("/checkout");
          }
        }, 3000);
      } finally {
        setIsProcessing(false);
      }
    };

    processStripeReturn();
  }, [router, searchParams]);

  // ── ERROR STATE ──
  if (error) {
    return (
      <div className="relative min-h-screen flex items-center justify-center bg-[#F4F0EB] overflow-hidden">
       

        <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Logo */}
          <div className="mb-10">
            <Image
              src="/Logo.svg"
              alt="Artovnia Logo"
              width={180}
              height={60}
              className="mx-auto"
              priority
            />
          </div>

          {/* Error illustration — broken canvas with spilled paint */}
          <div className="mb-10 flex justify-center">
            <svg
              className="w-48 h-48 text-[#3B3634]"
              viewBox="0 0 200 200"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Easel legs */}
              <line
                x1="70"
                y1="80"
                x2="50"
                y2="185"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                opacity="0.6"
              />
              <line
                x1="130"
                y1="80"
                x2="150"
                y2="185"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                opacity="0.6"
              />
              <line
                x1="100"
                y1="75"
                x2="100"
                y2="190"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                opacity="0.6"
              />
              {/* Easel shelf */}
              <line
                x1="65"
                y1="130"
                x2="135"
                y2="130"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.5"
              />

              {/* Canvas — tilted slightly to suggest something went wrong */}
              <rect
                x="55"
                y="20"
                width="90"
                height="110"
                rx="2"
                stroke="currentColor"
                strokeWidth="2"
                fill="#F4F0EB"
                opacity="0.9"
              />
              <rect
                x="60"
                y="25"
                width="80"
                height="100"
                rx="1"
                stroke="currentColor"
                strokeWidth="0.5"
                fill="none"
                opacity="0.3"
              />

              {/* Crack / break line across canvas */}
              <path
                d="M65 45 L80 50 L75 65 L90 60 L85 80 L100 75 L95 95 L110 90 L105 110 L120 105 L135 115"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                opacity="0.3"
                fill="none"
              />

              {/* X mark on canvas */}
              <g opacity="0.2" transform="translate(85, 55)">
                <line
                  x1="0"
                  y1="0"
                  x2="30"
                  y2="30"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <line
                  x1="30"
                  y1="0"
                  x2="0"
                  y2="30"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </g>

              {/* Spilled paint drops below */}
              <ellipse
                cx="80"
                cy="155"
                rx="12"
                ry="6"
                fill="currentColor"
                opacity="0.08"
              />
              <ellipse
                cx="115"
                cy="160"
                rx="8"
                ry="4"
                fill="currentColor"
                opacity="0.06"
              />
              <circle
                cx="95"
                cy="150"
                r="3"
                fill="currentColor"
                opacity="0.1"
              />
              <circle
                cx="125"
                cy="152"
                r="2"
                fill="currentColor"
                opacity="0.08"
              />
              <circle
                cx="70"
                cy="148"
                r="2.5"
                fill="currentColor"
                opacity="0.07"
              />

              {/* Fallen paintbrush */}
              <line
                x1="60"
                y1="170"
                x2="140"
                y2="175"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.3"
              />
              <path
                d="M56 170l-6-2c-2-1-2-3-1-4l5 2"
                fill="currentColor"
                opacity="0.2"
              />
            </svg>
          </div>

          {/* Decorative brush stroke divider */}
          <div className="flex justify-center mb-8">
            <svg
              className="w-64 h-4 text-[#3B3634]/20"
              viewBox="0 0 300 15"
              fill="none"
            >
              <path
                d="M5 8c40-5 80-3 120 0s80 5 120 1c15-2 30-3 45-1"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-4xl font-bold text-[#3B3634] mb-4">
            {locale === "pl" ? "Coś poszło nie tak" : "Something Went Wrong"}
          </h1>

          {/* Description */}
          <p className="text-lg sm:text-xl text-[#3B3634]/70 mb-10 max-w-lg mx-auto leading-relaxed">
            {error}
          </p>

          {/* Info card with artistic border */}
          <div className="relative bg-white/50 backdrop-blur-sm border border-[#3B3634]/10 p-8 mb-10">
           

            <h2 className="text-lg font-semibold text-[#3B3634] mb-4">
              {locale === "pl" ? "Co możesz zrobić?" : "What can you do?"}
            </h2>
            <ul className="text-[#3B3634]/70 space-y-3 max-w-md mx-auto">
              <li className="flex items-center justify-center gap-3">
                <svg
                  className="w-5 h-5 flex-shrink-0 opacity-40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>
                  {locale === "pl"
                    ? "Spróbuj odświeżyć stronę"
                    : "Try refreshing the page"}
                </span>
              </li>
              <li className="flex items-center justify-center gap-3">
                <svg
                  className="w-5 h-5 flex-shrink-0 opacity-40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>
                  {locale === "pl"
                    ? "Skontaktuj się z nami e-mailowo"
                    : "Contact us via email"}
                </span>
              </li>
              <li className="flex items-center justify-center gap-3">
                <svg
                  className="w-5 h-5 flex-shrink-0 opacity-40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>
                  {locale === "pl"
                    ? "Poczekaj chwilę i spróbuj ponownie"
                    : "Wait a moment and try again"}
                </span>
              </li>
            </ul>
          </div>

          {/* Retry Button */}
          <div className="space-y-4">
            <button
              onClick={() => window.location.reload()}
              className="group inline-flex items-center px-8 py-3.5 text-base font-medium text-white bg-[#3B3634] hover:bg-[#3B3634]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3B3634] transition-all duration-300"
            >
              <svg
                className="mr-2.5 h-5 w-5 transition-transform duration-300 group-hover:rotate-180"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              {locale === "pl" ? "Spróbuj ponownie" : "Try Again"}
            </button>

            <p className="text-sm text-[#3B3634]/40">
              {locale === "pl"
                ? "Przekierowujemy Cię z powrotem"
                : "Redirecting you back"}
              {dots}
            </p>
          </div>

          {/* Contact */}
          <div className="mt-14 pt-8 border-t border-[#3B3634]/10">
            <p className="text-[#3B3634]/50 text-sm mb-2">
              {locale === "pl"
                ? "Jeśli problem się utrzymuje, napisz do nas:"
                : "If the problem persists, contact us:"}
            </p>
            <a
              href="mailto:info.artovnia@gmail.com"
              className="text-[#3B3634] hover:text-[#3B3634]/70 font-medium underline underline-offset-4 transition-colors duration-200"
            >
              info.artovnia@gmail.com
            </a>
          </div>

          {/* Status */}
          <div className="mt-6 flex items-center justify-center space-x-2 text-sm text-[#3B3634]/40">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span>
              {locale === "pl"
                ? "Wystąpił problem z płatnością"
                : "Payment issue detected"}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ── LOADING / PROCESSING STATE ──
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#F4F0EB] overflow-hidden">
      

      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Logo */}
        <div className="mb-10">
          <Image
            src="/Logo.svg"
            alt="Artovnia Logo"
            width={180}
            height={60}
            className="mx-auto"
            priority
          />
        </div>

        {/* Loading illustration — paintbrush painting on canvas */}
        <div className="mb-10 flex justify-center">
          <svg
            className="w-48 h-48 text-[#3B3634]"
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Easel legs */}
            <line
              x1="70"
              y1="80"
              x2="50"
              y2="185"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              opacity="0.6"
            />
            <line
              x1="130"
              y1="80"
              x2="150"
              y2="185"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              opacity="0.6"
            />
            <line
              x1="100"
              y1="75"
              x2="100"
              y2="190"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              opacity="0.6"
            />
            {/* Easel shelf */}
            <line
              x1="65"
              y1="130"
              x2="135"
              y2="130"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.5"
            />

            {/* Canvas */}
            <rect
              x="55"
              y="20"
              width="90"
              height="110"
              rx="2"
              stroke="currentColor"
              strokeWidth="2"
              fill="#F4F0EB"
              opacity="0.9"
            />
            <rect
              x="60"
              y="25"
              width="80"
              height="100"
              rx="1"
              stroke="currentColor"
              strokeWidth="0.5"
              fill="none"
              opacity="0.3"
            />

            {/* Animated brush strokes appearing on canvas */}
            <path
              d="M75 50c10-5 20-3 30 2s15 8 20 3"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              opacity="0.15"
            >
              <animate
                attributeName="opacity"
                values="0.05;0.2;0.05"
                dur="3s"
                repeatCount="indefinite"
              />
            </path>
            <path
              d="M70 70c15 5 25 0 35-5s20-8 25 0"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              opacity="0.1"
            >
              <animate
                attributeName="opacity"
                values="0.05;0.18;0.05"
                dur="3s"
                begin="0.5s"
                repeatCount="indefinite"
              />
            </path>
            <path
              d="M80 90c8-3 18 5 25 2s12-6 20-2"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              opacity="0.12"
            >
              <animate
                attributeName="opacity"
                values="0.05;0.2;0.05"
                dur="3s"
                begin="1s"
                repeatCount="indefinite"
              />
            </path>

            {/* Paint dots appearing */}
            <circle cx="85" cy="45" r="3" fill="currentColor" opacity="0.08">
              <animate
                attributeName="opacity"
                values="0.03;0.15;0.03"
                dur="2.5s"
                begin="0.3s"
                repeatCount="indefinite"
              />
            </circle>
            <circle cx="110" cy="80" r="4" fill="currentColor" opacity="0.06">
              <animate
                attributeName="opacity"
                values="0.03;0.12;0.03"
                dur="2.5s"
                begin="0.8s"
                repeatCount="indefinite"
              />
            </circle>
            <circle
              cx="95"
              cy="105"
              r="2.5"
              fill="currentColor"
              opacity="0.1"
            >
              <animate
                attributeName="opacity"
                values="0.03;0.18;0.03"
                dur="2.5s"
                begin="1.3s"
                repeatCount="indefinite"
              />
            </circle>

            {/* Checkmark being drawn on canvas */}
            <g opacity="0.25" transform="translate(82, 55)">
              <path
                d="M5 18 L15 28 L35 8"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                strokeDasharray="50"
                strokeDashoffset="50"
              >
                <animate
                  attributeName="stroke-dashoffset"
                  values="50;0;0;50"
                  dur="4s"
                  repeatCount="indefinite"
                />
              </path>
            </g>

            {/* Paint palette below easel */}
            <ellipse
              cx="100"
              cy="162"
              rx="28"
              ry="14"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
              opacity="0.35"
            />
            <ellipse
              cx="90"
              cy="162"
              rx="5"
              ry="3.5"
              stroke="currentColor"
              strokeWidth="1"
              fill="none"
              opacity="0.25"
            />
            <circle
              cx="102"
              cy="155"
              r="2.5"
              fill="currentColor"
              opacity="0.15"
            />
            <circle
              cx="112"
              cy="158"
              r="2"
              fill="currentColor"
              opacity="0.12"
            />
            <circle
              cx="108"
              cy="166"
              r="2.5"
              fill="currentColor"
              opacity="0.1"
            />
            <circle
              cx="96"
              cy="168"
              r="2"
              fill="currentColor"
              opacity="0.13"
            />

            {/* Paintbrush in motion */}
            <g>
              <animateTransform
                attributeName="transform"
                type="rotate"
                values="-5 145 40;5 145 40;-5 145 40"
                dur="2s"
                repeatCount="indefinite"
              />
              <line
                x1="140"
                y1="40"
                x2="158"
                y2="155"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.3"
              />
              <path
                d="M139.5 40l1-8c0-2 1.5-3 1.5-3s1.5 1 1.5 3l-1 8"
                fill="currentColor"
                opacity="0.2"
              />
            </g>
          </svg>
        </div>

        {/* Decorative brush stroke divider */}
        <div className="flex justify-center mb-8">
          <svg
            className="w-64 h-4 text-[#3B3634]/20"
            viewBox="0 0 300 15"
            fill="none"
          >
            <path
              d="M5 8c40-5 80-3 120 0s80 5 120 1c15-2 30-3 45-1"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Heading */}
        <h1 className="heading-xl  font-bold text-[#3B3634] mb-4">
          {locale === "pl"
            ? "Malujemy Twoje zamówienie"
            : "Crafting Your Order"}
        </h1>

        {/* Description */}
        <p className="text-lg sm:text-xl text-[#3B3634]/70 mb-10 max-w-lg mx-auto leading-relaxed">
          {locale === "pl"
            ? "Proszę czekać, potwierdzamy płatność i przygotowujemy Twoje dzieła sztuki."
            : "Please wait while we confirm your payment and prepare your artworks."}
        </p>

        {/* Progress card with artistic border */}
        <div className="relative bg-white/50 backdrop-blur-sm border border-[#3B3634]/10 p-8 mb-10">
       

          <h2 className="text-lg font-semibold text-[#3B3634] mb-5">
            {locale === "pl" ? "Trwa przetwarzanie" : "Processing"}
          </h2>

          <ul className="text-[#3B3634]/70 space-y-3 max-w-md mx-auto">
            <li className="flex items-center justify-center gap-3">
              <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center">
                <div className="w-2 h-2 bg-[#3B3634] rounded-full animate-pulse" />
              </div>
              <span>
                {locale === "pl"
                  ? "Potwierdzanie płatności"
                  : "Confirming payment"}
              </span>
            </li>
            <li className="flex items-center justify-center gap-3">
              <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center">
                <div
                  className="w-2 h-2 bg-[#3B3634] rounded-full animate-pulse"
                  style={{ animationDelay: "0.3s" }}
                />
              </div>
              <span>
                {locale === "pl"
                  ? "Tworzenie zamówienia"
                  : "Creating your order"}
              </span>
            </li>
            <li className="flex items-center justify-center gap-3">
              <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center">
                <div
                  className="w-2 h-2 bg-[#3B3634] rounded-full animate-pulse"
                  style={{ animationDelay: "0.6s" }}
                />
              </div>
              <span>
                {locale === "pl"
                  ? "Przygotowywanie potwierdzenia"
                  : "Preparing confirmation"}
              </span>
            </li>
          </ul>

          {/* Artistic progress bar */}
          <div className="mt-6 relative">
            <div className="h-0.5 bg-[#3B3634]/10 overflow-hidden">
              <div
                className="h-full bg-[#3B3634]/40 animate-[shimmer_2s_ease-in-out_infinite]"
                style={{
                  width: "40%",
                  animation:
                    "shimmer 2s ease-in-out infinite",
                }}
              />
            </div>
          </div>
        </div>

       

        {/* Status */}
        <div className="mt-8 flex items-center justify-center space-x-2 text-sm text-[#3B3634]/40">
          <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
          <span>
            {locale === "pl"
              ? "Przetwarzanie płatności"
              : "Processing payment"}
          </span>
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(350%);
          }
        }
      `}</style>
    </div>
  );
};

export default StripeReturnPageContent;