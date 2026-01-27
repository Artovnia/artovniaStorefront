'use client'

import Image from 'next/image'

export default function MaintenancePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F0EB]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Logo */}
        <div className="mb-8">
          <Image
            src="/Logo.svg"
            alt="Artovnia Logo"
            width={180}
            height={60}
            className="mx-auto"
            priority
          />
        </div>

        {/* Icon */}
        <div className="mb-8">
          <svg
            className="mx-auto h-24 w-24 text-[#3B3634]/40"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </div>

        {/* Heading */}
        <h1 className="text-4xl font-bold text-[#3B3634] mb-4">
          Strona w trakcie konserwacji
        </h1>

        {/* Description */}
        <p className="text-xl text-[#3B3634]/70 mb-8">
          Przepraszamy za niedogodności. Obecnie przeprowadzamy prace
          konserwacyjne, aby poprawić jakość naszych usług.
        </p>

        {/* Additional Info */}
        <div className="bg-white/60 border border-[#3B3634]/10 p-6 mb-8">
          <h2 className="text-lg font-semibold text-[#3B3634] mb-3">
            Co się dzieje?
          </h2>
          <p className="text-[#3B3634]/70 mb-4">
            Nasz serwer jest obecnie niedostępny. Może to być spowodowane:
          </p>
          <ul className="text-left text-[#3B3634]/70 space-y-2 max-w-md mx-auto">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Planowaną konserwacją systemu</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Aktualizacją oprogramowania</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Tymczasowymi problemami technicznymi</span>
            </li>
          </ul>
        </div>

        {/* Retry Button */}
        <div className="space-y-4">
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-6 py-3 text-base font-medium rounded-none text-white bg-[#3B3634] hover:bg-[#3B3634]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3B3634] transition-colors"
          >
            <svg
              className="mr-2 h-5 w-5"
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
            Spróbuj ponownie
          </button>

          <p className="text-sm text-[#3B3634]/50">
            Strona automatycznie sprawdzi dostępność serwera
          </p>
        </div>

        {/* Contact Info */}
        <div className="mt-12 pt-8 border-t border-[#3B3634]/20">
          <p className="text-[#3B3634]/70">
            Jeśli problem się utrzymuje, skontaktuj się z nami:
          </p>
          <a
            href="mailto:support@artovnia.com"
            className="text-[#3B3634] hover:text-[#3B3634]/70 font-medium underline underline-offset-4"
          >
            support@artovnia.com
          </a>
        </div>

        {/* Status Indicator */}
        <div className="mt-8 flex items-center justify-center space-x-2 text-sm text-[#3B3634]/50">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></div>
            <span>Status: Niedostępny</span>
          </div>
        </div>
      </div>
    </div>
  )
}