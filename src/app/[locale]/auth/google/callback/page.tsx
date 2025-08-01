"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { handleGoogleCallback } from "@/lib/data/customer"

export default function GoogleCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)
  const [isRegistration, setIsRegistration] = useState(false)

  useEffect(() => {
    const validateCallback = async () => {
      try {
        // Get query parameters from Google OAuth callback
        const code = searchParams.get("code")
        const state = searchParams.get("state")
        const error = searchParams.get("error")
        
        // Detect if this is a registration flow by checking localStorage
        const flowType = localStorage.getItem('google_oauth_flow')
        const isRegisterFlow = flowType === 'registration'
        setIsRegistration(isRegisterFlow)
        console.log('🔍 OAuth flow type detected:', flowType, 'isRegisterFlow:', isRegisterFlow)
        
        // Clear the flow type from localStorage after reading it
        localStorage.removeItem('google_oauth_flow')
        
        if (error) {
          throw new Error(`Authentication failed: ${error}`)
        }
        
        if (!code) {
          throw new Error("No authorization code received from Google")
        }

        setMessage(isRegisterFlow ? "Weryfikacja rejestracji Google..." : "Weryfikacja uwierzytelnienia Google...")

        // Use server action to handle the callback with proper SDK configuration
        const result = await handleGoogleCallback(code, state || undefined)

        if (result.error) {
          throw new Error(result.error)
        }

        setMessage(isRegisterFlow ? "Rejestracja pomyślna! Przekierowywanie..." : "Uwierzytelnienie pomyślne! Przekierowywanie...")
        setIsSuccess(true)
        setStatus("success")

        // Redirect to user page after a brief delay
        setTimeout(() => {
          router.push("/user")
        }, 1500)
        
      } catch (error: any) {
        console.error("Google callback error:", error)
        setStatus("error")
        setMessage(error.message || "Authentication failed")
        
        // Redirect to login page after delay
        setTimeout(() => {
          router.push("/login")
        }, 3000)
      }
    }

    // Start the validation process
    validateCallback()
  }, [searchParams, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        {status === "loading" && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              {isRegistration ? "Rejestracja z Google..." : "Logowanie z Google..."}
            </h2>
            <p className="text-gray-600">{message}</p>
          </>
        )}
        
        {status === "success" && (
          <>
            <div className="text-green-500 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Sukces!
            </h2>
            <p className="text-gray-600">{message}</p>
          </>
        )}
        
        {status === "error" && (
          <>
            <div className="text-red-500 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              {isRegistration ? "Nieudana rejestracja z Google" : "Nieudane logowanie z Google"}
            </h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <p className="text-sm text-gray-500">
              Przekierowywanie do strony logowania...
            </p>
          </>
        )}
      </div>
    </div>
  )
}
