'use client'

import { useState } from 'react'
import { Link } from '@/i18n/routing'
import { subscribeToNewsletter } from '@/lib/data/newsletter'
import NewsletterForm from '@/components/molecules/NewsletterForm/NewsletterForm'
import { Checkbox } from '@/components/atoms/Checkbox/Checkbox'

interface NewsletterSubscriptionProps {
  className?: string
}

export default function NewsletterSubscription({ className = '' }: NewsletterSubscriptionProps) {
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  const handleNewsletterSubmit = async (email: string) => {
    try {
      await subscribeToNewsletter({
        email,
        agreedToTerms
      })
    } catch (error: any) {
      throw new Error(error.message || 'Nie udało się zapisać do newslettera')
    }
  }

  return (
    <div className={`text-center ${className}`}>
      {/* Main heading */}
      <h2 className="text-[#3B3634] font-instrument-serif text-2xl md:text-3xl lg:text-4xl mb-8 max-w-2xl mx-auto">
        Nie przegap okazji i zapisz się na <em className="font-instrument-serif italic">newsletter!</em>
      </h2>

      {/* Newsletter form */}
      <div className="mb-4 max-w-2xl mx-auto">
        <NewsletterForm onSubmit={handleNewsletterSubmit} />
      </div>

      {/* Terms agreement checkbox */}
      <div className="flex justify-center max-w-[540px] mx-auto">
        <Checkbox
          checked={agreedToTerms}
          onChange={(e) => setAgreedToTerms(e.target.checked)}
          className="items-start"
          label={
            <span className="text-[#3B3634] font-instrument-sans text-xs md:text-sm leading-relaxed text-left max-w-[540px]">
              WYRAŻAM ZGODĘ NA PRZETWARZANIE MOICH DANYCH OSOBOWYCH ZGODNIE 
              Z <Link href="/polityka-prywatnosci" className="underline hover:text-primary transition-colors">POLITYKĄ PRYWATNOŚCI</Link> W CELU PRZESŁANIA NEWSLETTERA.
            </span>
          }
        />
      </div>
    </div>
  )
}