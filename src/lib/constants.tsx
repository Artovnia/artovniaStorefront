import React from "react"
import Image from "next/image"
import { CreditCard, CreditCardSolid, Google } from "@medusajs/icons"

// Common icon size for consistency
const ICON_SIZE = {
  width: "34px",
  height: "34px"
}

const ICON_SIZE_40 = {
  width: "40px",
  height: "40px"
}

// Custom SVG icon for BLIK payment method
type IconProps = {
  width?: string;
  height?: string;
}

// Wrapper components to force sizing on Medusa UI icons
const SizedCreditCard: React.FC<IconProps> = ({ width = ICON_SIZE.width, height = ICON_SIZE.height }) => (
  <div style={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <CreditCard />
  </div>
)

const SizedCreditCardSolid: React.FC<IconProps> = ({ width = ICON_SIZE.width, height = ICON_SIZE.height }) => (
  <div style={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <CreditCardSolid />
  </div>
)

const SizedGoogle: React.FC<IconProps> = ({ width = ICON_SIZE.width, height = ICON_SIZE.height }) => (
  <div style={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <Google />
  </div>
)

const BlikIcon: React.FC<IconProps> = ({ width = ICON_SIZE.width, height = ICON_SIZE_40.height }) => (
  <div style={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <Image 
      src="/BLIK LOGO RGB.png" 
      alt="BLIK" 
      style={{ maxWidth: '100%', maxHeight: '100%', width: 'auto', height: 'auto', objectFit: 'contain' }} 
      width={34}
      height={34}
    />
  </div>
)

const Przelewy24Icon: React.FC<IconProps> = ({ width = ICON_SIZE.width, height = ICON_SIZE_40.height }) => (
  <div style={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <Image 
      src="/Przelewy24_logo.svg" 
      alt="Przelewy24" 
      style={{ maxWidth: '100%', maxHeight: '100%', width: 'auto', height: 'auto', objectFit: 'contain' }} 
      width={34}
      height={34}
    />
  </div>
)

// Custom SVG icon for Bank Transfer payment method
const BankTransferIcon: React.FC<IconProps> = ({ width = ICON_SIZE_40.width, height = ICON_SIZE_40.height }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g opacity="0.9">
      <rect x="1" y="14" width="8" height="2" fill="currentColor" opacity="0.8"/>
      <rect x="1.5" y="10" width="1" height="4" fill="currentColor"/>
      <rect x="3.5" y="10" width="1" height="4" fill="currentColor"/>
      <rect x="5.5" y="10" width="1" height="4" fill="currentColor"/>
      <rect x="7.5" y="10" width="1" height="4" fill="currentColor"/>
      <path d="M0.5 10 L5 7 L9.5 10 L8.5 10 L5 8 L1.5 10 Z" fill="currentColor"/>
      <rect x="4" y="12" width="2" height="2" fill="currentColor" opacity="0.6"/>
    </g>
    <g opacity="0.9">
      <rect x="15" y="14" width="8" height="2" fill="currentColor" opacity="0.8"/>
      <rect x="15.5" y="10" width="1" height="4" fill="currentColor"/>
      <rect x="17.5" y="10" width="1" height="4" fill="currentColor"/>
      <rect x="19.5" y="10" width="1" height="4" fill="currentColor"/>
      <rect x="21.5" y="10" width="1" height="4" fill="currentColor"/>
      <path d="M14.5 10 L19 7 L23.5 10 L22.5 10 L19 8 L15.5 10 Z" fill="currentColor"/>
      <rect x="18" y="12" width="2" height="2" fill="currentColor" opacity="0.6"/>
    </g>
    <g stroke="currentColor" strokeWidth="1.5" fill="none">
      <path d="M10 12 L14 12" strokeLinecap="round"/>
      <path d="M12.5 10.5 L14 12 L12.5 13.5" strokeLinecap="round" strokeLinejoin="round"/>
    </g>
    <g fill="currentColor" opacity="0.7" fontFamily="Arial, sans-serif" fontSize="8" fontWeight="bold">
      <text x="12" y="9" textAnchor="middle">$</text>
    </g>
    <g stroke="currentColor" strokeWidth="0.5" opacity="0.3">
      <line x1="9" y1="12" x2="10" y2="12"/>
      <line x1="14" y1="12" x2="15" y2="12"/>
    </g>
  </svg>
)

/* Map of payment provider_id to their title and icon. Add in any payment providers you want to use. */
export const paymentInfoMap: Record<
  string,
  { title: string; icon: React.JSX.Element }
> = {
  pp_stripe_stripe_connect: {
    title: "Karta płatnicza",
    icon: <SizedCreditCard width={ICON_SIZE_40.width} height={ICON_SIZE_40.height} />,
  },
  "pp_card_stripe-connect": {
    title: "Karta płatnicza",
    icon: <SizedCreditCard width={ICON_SIZE_40.width} height={ICON_SIZE_40.height} />,
  },
  "pp_stripe-blik_stripe-connect": {
    title: "BLIK",
    icon: <BlikIcon width={ICON_SIZE_40.width} height={ICON_SIZE_40.height} />,
  },
  "pp_stripe-przelewy24_stripe-connect": {
    title: "Przelewy24",
    icon: <Przelewy24Icon width={ICON_SIZE_40.width} height={ICON_SIZE_40.height} />,
  },
  pp_paypal_paypal: {
    title: "PayPal",
    icon: <SizedCreditCard width={ICON_SIZE_40.width} height={ICON_SIZE_40.height} />,
  },
  pp_system_default: {
    title: "Manual Payment",
    icon: <SizedCreditCard width={ICON_SIZE.width} height={ICON_SIZE.height} />,
  },
  /* PayU payment providers */
  "pp_payu-card": {
    title: "PayU - Card",
    icon: <SizedCreditCardSolid width={ICON_SIZE.width} height={ICON_SIZE.height} />,
  },
  "pp_payu-blik": {
    title: "PayU - BLIK",
    icon: <BlikIcon width={ICON_SIZE.width} height={ICON_SIZE.height} />,
  },
  "pp_payu-transfer": {
    title: "PayU - Transfer",
    icon: <BankTransferIcon width={ICON_SIZE_40.width} height={ICON_SIZE_40.height} />,
  },
  "pp_payu-googlepay": {
    title: "PayU - Google Pay",
    icon: <SizedGoogle width={ICON_SIZE.width} height={ICON_SIZE.height} />,
  }
  // Add more payment providers here
}

// This checks if it is any Stripe payment method
export const isStripe = (providerId?: string) => {
  return providerId?.includes("stripe-connect") || providerId?.startsWith("pp_stripe_")
}

// Check if the provider is any PayU payment method
export const isPayU = (providerId?: string) => {
  if (!providerId) return false;
  
  // Check for the correct PayU formats:
  // - pp_payu-card, pp_payu-blik, pp_payu-transfer
  return providerId.startsWith("pp_payu-")
}

export const isPaypal = (providerId?: string) => {
  return providerId?.startsWith("pp_paypal")
}

export const isManual = (providerId?: string) => {
  return providerId?.startsWith("pp_system_default")
}

// Helper functions to determine specific PayU payment methods
export const isPayUCard = (providerId?: string) => {
  return providerId === "pp_payu-card"
}

export const isPayUBlik = (providerId?: string) => {
  return providerId === "pp_payu-blik"
}

export const isPayUTransfer = (providerId?: string) => {
  return providerId === "pp_payu-transfer"
}

export const isPayUGooglePay = (providerId?: string) => {
  return providerId === "pp_payu-googlepay"
}

// Get PayU payment method type from provider ID
export const getPayUMethod = (providerId?: string): string | null => {
  if (!providerId || !isPayU(providerId)) return null;
  
  if (providerId === "pp_payu-card") return "card";
  if (providerId === "pp_payu-blik") return "blik";
  if (providerId === "pp_payu-transfer") return "transfer";
  if (providerId === "pp_payu-googlepay") return "googlepay";
  
  return null;
}

// Add currencies that don't need to be divided by 100
export const noDivisionCurrencies = [
  "krw",
  "jpy",
  "vnd",
  "clp",
  "pyg",
  "xaf",
  "xof",
  "bif",
  "djf",
  "gnf",
  "kmf",
  "mga",
  "rwf",
  "xpf",
  "htg",
  "vuv",
  "xag",
  "xdr",
  "xau",
]