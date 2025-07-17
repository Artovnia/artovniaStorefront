// src/app/[locale]/store/payu/return/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useParams } from "next/navigation"
import React from "react"

/**
 * PayU Store Return Handler
 * 
 * This page catches redirects from PayU to /[locale]/store/payu/return
 * and redirects them to the proper checkout payu return page
 */
export default function PayUStoreReturnPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const params = useParams()
  const locale = params.locale as string || 'pl'
  const [isRedirecting, setIsRedirecting] = useState(false)
  
  useEffect(() => {
    if (isRedirecting) return
    
    // Extract important PayU parameters
    const sessionId = searchParams.get('session_id')
    const extOrderId = searchParams.get('ext_order_id')
    const orderId = searchParams.get('orderId')
    const status = searchParams.get('status')
    const error = searchParams.get('error')
    
    console.log('PayU store return parameters:', {
      sessionId,
      extOrderId,
      orderId,
      status,
      error,
      allParams: Object.fromEntries(searchParams.entries()),
      locale
    })

    // Preserve all query parameters
    const queryParams = new URLSearchParams()
    searchParams.forEach((value, key) => {
      queryParams.append(key, value)
    })
    
    // Redirect to the checkout payu return page in the correct locale
    const redirectUrl = `/${locale}/payu/return?${queryParams.toString()}`
    console.log(`Redirecting from store route to checkout route: ${redirectUrl}`)
    
    // Prevent multiple redirects
    setIsRedirecting(true)
    
    // Redirect immediately
    router.replace(redirectUrl)
  }, [router, searchParams, locale, isRedirecting])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="p-8 bg-white rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold mb-4">Processing Payment</h1>
        <p className="mb-4">Please wait while we redirect you...</p>
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    </div>
  )
}
