"use client"

import React, { useState } from "react"
import clsx from "clsx"
import { Input } from "../atoms/Input"
import { Textarea } from "../atoms/Textarea"
import { Button } from "../atoms/Button"
import { createTicket, CreateTicketInput } from "@/lib/data/tickets"

interface TicketFormProps {
  onSuccess?: () => void
  customerEmail?: string
  customerName?: string
}

export const TicketForm: React.FC<TicketFormProps> = ({
  onSuccess,
  customerEmail = "",
  customerName = "",
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [formData, setFormData] = useState<{
    title: string
    description: string
    type: "feature_request" | "bug_report" | "support" | "other"
    customer_email: string
    customer_name: string
  }>({
    title: "",
    description: "",
    type: "support",
    customer_email: customerEmail,
    customer_name: customerName,
  })
  const [files, setFiles] = useState<File[]>([])

  // Email validation function
  const validateEmail = (email: string): boolean => {
    // RFC 5322 compliant regex (simplified)
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
    
    if (!email || email.length === 0) {
      setEmailError("Adres e-mail jest wymagany")
      return false
    }
    
    if (email.length > 254) {
      setEmailError("Adres e-mail jest za długi")
      return false
    }
    
    if (!emailRegex.test(email)) {
      setEmailError("Nieprawidłowy format adresu e-mail")
      return false
    }
    
    // Additional validation: check for common typos
    const commonDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'onet.pl', 'wp.pl', 'interia.pl']
    const domain = email.split('@')[1]?.toLowerCase()
    
    if (domain && commonDomains.includes(domain.replace(/[0-9]/g, ''))) {
      // Check for common typos in domain
      const typos: Record<string, string> = {
        'gmai.com': 'gmail.com',
        'gmial.com': 'gmail.com',
        'yahooo.com': 'yahoo.com',
        'hotmial.com': 'hotmail.com',
      }
      
      if (typos[domain]) {
        setEmailError(`Czy na pewno? Może chodziło o ${typos[domain]}?`)
        return false
      }
    }
    
    setEmailError(null)
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    // Validate email before submission
    if (!validateEmail(formData.customer_email)) {
      setIsLoading(false)
      return
    }

    try {
      const ticketData: CreateTicketInput = {
        ...formData,
        priority: "medium",
        files,
      }

      await createTicket(ticketData)
      setSuccess(true)
      
      // Reset form
      setFormData({
        title: "",
        description: "",
        type: "support",
        customer_email: customerEmail,
        customer_name: customerName,
      })
      setFiles([])

      if (onSuccess) {
        onSuccess()
      }
    } catch (err: any) {
      setError(err.message || "Failed to create ticket")
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files))
    }
  }

  if (success) {
    return (
      <div className="bg-primary border p-6 text-center">
        <svg
          className="mx-auto h-12 w-12 text-green-400 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="heading-md font-semibold text-[#3B3634] mb-2 font-instrument-serif">
          Zgłoszenie zostało wysłane!
        </h3>
        <p className="text-[#3B3634] mb-4 font-instrument-sans">
          Otrzymaliśmy Twoje zgłoszenie i wkrótce się z Tobą skontaktujemy.
        </p>
        <Button onClick={() => setSuccess(false)} variant="primary">
          Wyślij kolejne zgłoszenie
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 p-4 text-red-700 font-instrument-sans">
          {error}
        </div>
      )}
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-1 font-instrument-sans">
          Typ zgłoszenia <span className="text-red-500">*</span>
        </label>
        
        {/* Custom Dropdown Button */}
        <button
          type="button"
          onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
          className={clsx(
            "w-full flex items-center justify-between gap-2 px-4 py-2.5",
            "bg-white hover:bg-[#3B3634]",
            "border border-[#3B3634]/20 hover:border-[#3B3634]/40",
            "transition-all duration-300 ease-out",
            "text-sm font-semibold text-[#3B3634] hover:text-white",
            "shadow-sm hover:shadow-md",
            "group relative overflow-hidden",
            {
              "ring-2 ring-[#3B3634]/20": isTypeDropdownOpen
            }
          )}
        >
          <span className="relative z-10 font-instrument-sans">
            {formData.type === "support" && "Wsparcie"}
            {formData.type === "bug_report" && "Zgłoszenie błędu"}
            {formData.type === "feature_request" && "Propozycja funkcji"}
            {formData.type === "other" && "Inne"}
          </span>
          <svg 
            className={clsx(
              "w-4 h-4 transition-transform duration-300 relative z-10",
              { "rotate-180": isTypeDropdownOpen }
            )} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Custom Dropdown Menu */}
        {isTypeDropdownOpen && (
          <>
            {/* Backdrop with blur */}
            <div 
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 animate-in fade-in duration-200" 
              onClick={() => setIsTypeDropdownOpen(false)}
            />
            
            {/* Dropdown with artistic styling */}
            <div className="absolute left-0 mt-2 w-full bg-primary shadow-2xl border border-[#3B3634]/30 z-50 overflow-hidden animate-in slide-in-from-top-2 duration-300 rounded-sm">
              {/* Decorative background elements */}
              <div className="absolute top-0 left-0 w-24 h-24 bg-[#3B3634]/5 blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
              
              <div className="py-2 relative">
                {[
                  { value: "support", label: "Wsparcie" },
                  { value: "bug_report", label: "Zgłoszenie błędu" },
                  { value: "feature_request", label: "Propozycja funkcji" },
                  { value: "other", label: "Inne" }
                ].map((option, index) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        type: option.value as CreateTicketInput["type"],
                      })
                      setIsTypeDropdownOpen(false)
                    }}
                    style={{
                      animationDelay: `${index * 30}ms`,
                    }}
                    className={clsx(
                      "w-full flex items-center gap-3 px-4 py-2.5",
                      "text-left font-semibold transition-all duration-200",
                      "group/item relative overflow-hidden animate-in fade-in slide-in-from-left-2",
                      "font-instrument-sans",
                      {
                        "bg-[#3B3634] text-white": formData.type === option.value,
                        "text-[#3B3634] hover:bg-[#3B3634] hover:text-white": formData.type !== option.value,
                      }
                    )}
                  >
                    <span className="relative z-10">{option.label}</span>
                    {formData.type === option.value && (
                      <svg className="w-4 h-4 ml-auto relative z-10" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
      <Input
        label="Imię i nazwisko"
        value={formData.customer_name}
        onChange={(e) =>
          setFormData({ ...formData, customer_name: e.target.value })
        }
        required
        placeholder="Jan Kowalski"
      />

      <div>
        <Input
          label="Adres e-mail"
          type="email"
          value={formData.customer_email}
          onChange={(e) => {
            setFormData({ ...formData, customer_email: e.target.value })
            // Clear error when user types
            if (emailError) setEmailError(null)
          }}
          onBlur={() => {
            // Validate on blur
            if (formData.customer_email) {
              validateEmail(formData.customer_email)
            }
          }}
          required
          placeholder="jan@example.com"
          className={emailError ? "border-red-500" : ""}
        />
        {emailError && (
          <p className="mt-1 text-xs text-red-500 font-instrument-sans">
            {emailError}
          </p>
        )}
        {formData.customer_email && !emailError && formData.customer_email.includes('@') && (
          <p className="mt-1 text-xs text-green-600 font-instrument-sans">
            ✓ Prawidłowy adres e-mail
          </p>
        )}
      </div>


      <div>
        <Input
          label="Temat"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
          placeholder="Krótki opis problemu"
        />
        <p className={clsx(
          "mt-1 text-xs font-instrument-sans",
          formData.title.length > 0 && formData.title.length < 5 
            ? "text-red-500" 
            : "text-gray-500"
        )}>
          Minimum 5 znaków {formData.title.length > 0 && `(${formData.title.length}/5)`}
        </p>
      </div>



      <div>
        <Textarea
          label="Opis"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          required
          rows={6}
          placeholder="Opisz szczegółowo swój problem..."
        />
        <p className={clsx(
          "mt-1 text-xs font-instrument-sans",
          formData.description.length > 0 && formData.description.length < 20 
            ? "text-red-500" 
            : "text-gray-500"
        )}>
          Minimum 20 znaków {formData.description.length > 0 && `(${formData.description.length}/20)`}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1 font-instrument-sans">
          Załączniki (opcjonalnie)
        </label>
        <input
          type="file"
          multiple
          onChange={handleFileChange}
          className="w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-[#3b3634] focus:border-transparent font-instrument-sans"
          accept="image/*,.pdf,.doc,.docx"
        />
        {files.length > 0 && (
          <p className="mt-1 text-sm text-gray-500 font-instrument-sans">
            Wybrano plików: {files.length}
          </p>
        )}
      </div>

      <Button type="submit" isLoading={isLoading} className="w-full">
        Wyślij zgłoszenie
      </Button>
    </form>
  )
}
