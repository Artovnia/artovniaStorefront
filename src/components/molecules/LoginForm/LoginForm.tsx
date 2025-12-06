"use client"
import {
  FieldError,
  FieldValues,
  FormProvider,
  useForm,
  useFormContext,
} from "react-hook-form"
import { Button } from "@/components/atoms"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { LabeledInput } from "@/components/cells"
import { loginFormSchema, LoginFormData } from "./schema"
import { useState } from "react"
import { login, loginWithGoogle } from "@/lib/data/customer"
import { useRouter } from '@/i18n/routing'

interface LoginFormProps {
  compact?: boolean // For use in modals
}

export const LoginForm = ({ compact = false }: LoginFormProps = {}) => {
  const methods = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  return (
    <FormProvider {...methods}>
      <Form compact={compact} />
    </FormProvider>
  )
}

const Form = ({ compact }: { compact: boolean }) => {
  const [error, setError] = useState("")
  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useFormContext()
  const router = useRouter()

  const submit = async (data: FieldValues) => {
    const formData = new FormData()
    formData.append("email", data.email)
    formData.append("password", data.password)

    const res = await login(formData)
    if (res) {
      setError(res)
      return
    }
    setError("")
    
    // Check if user came from checkout flow
    const shouldRedirectToCheckout = sessionStorage.getItem('checkout_redirect')
    if (shouldRedirectToCheckout) {
      sessionStorage.removeItem('checkout_redirect')
      router.push('/checkout?step=address') // Use router.push to preserve cart state
    } else {
      router.push("/user")
    }
  }

  const handleGoogleLogin = async () => {
    try {
      setError("")
      
      // CRITICAL: Mark this as a login flow for the callback page
      localStorage.setItem('google_oauth_flow', 'login')
   
      
      const result = await loginWithGoogle()
      
      if (result?.error) {
        setError(result.error)
        return
      }
      
      if (result?.location) {
        // Redirect to Google OAuth
        window.location.href = result.location
        return
      }
      
      if (result?.success) {
        // Check if user came from checkout flow
        const shouldRedirectToCheckout = sessionStorage.getItem('checkout_redirect')
        if (shouldRedirectToCheckout) {
          sessionStorage.removeItem('checkout_redirect')
          router.push('/checkout?step=address') // Use router.push to preserve cart state
        } else {
          router.push("/user")
        }
        return
      }
      
      setError("Unexpected response from Google authentication")
    } catch (error: any) {
      setError(error.message || "Google login failed")
    }
  }

  const formContent = (
    <form onSubmit={handleSubmit(submit)}>
      <div className={compact ? "space-y-4" : "w-96 max-w-full mx-auto space-y-4"}>
          <LabeledInput
            label="E-mail"
            placeholder="Twój adres e-mail"
            error={errors.email as FieldError}
            {...register("email")}
          />
          <LabeledInput
            label="Hasło"
            placeholder="Twoje hasło"
            type="password"
            error={errors.password as FieldError}
            {...register("password")}
          />
          {error && <p className="label-md text-negative">{error}</p>}
          <Button className="w-full" disabled={isSubmitting}>
            Zaloguj się
          </Button>
          
          {/* Divider */}
          <div className="flex items-center my-4">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-4 text-sm text-gray-500">lub</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>
          
          {/* Google Login Button */}
          <Button 
            type="button"
            onClick={handleGoogleLogin}
            className="w-full bg-white border border-[#3B3634] text-[#3B3634] hover:bg-[#3B3634] hover:text-white flex items-center justify-center gap-3"
            disabled={isSubmitting}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Zaloguj się z Google
          </Button>
          
          {!compact && (
            <>
              <div className="flex justify-center">
                <Link href="/forgot-password" className="label-md text-secondary hover:underline">
                  Zapomniałeś hasła?
                </Link>
              </div>
              <p className="text-center label-md">
                Nie masz jeszcze konta?{" "}
                <Link href="/user/register" className="underline">
                  Zarejestruj się!
                </Link>
              </p>
            </>
          )}
        </div>
      </form>
  )

  if (compact) {
    return (
      <div>
        <h2 className="text-2xl font-instrument-serif font-normal  text-[#3B3634] mb-4 text-center">
          Zaloguj się
        </h2>
        {formContent}
      </div>
    )
  }

  return (
    <main className="container">
      <h1 className="heading-xl text-center uppercase my-6 font-instrument-serif">
        Zaloguj się do swojego konta
      </h1>
      {formContent}
    </main>
  )
}
