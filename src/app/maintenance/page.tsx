"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function MaintenancePage() {
  const [dots, setDots] = useState(".");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "." : prev + "."));
    }, 600);
    return () => clearInterval(interval);
  }, []);

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


        

        {/* Heading */}
        <h1 className="heading-lg  font-bold text-[#3B3634] mb-4">
          Tworzymy coś pięknego
        </h1>

        {/* Description */}
        <p className="text-sm sm:text-lg text-[#3B3634]/70 mb-10 max-w-lg mx-auto leading-relaxed">
          Strona jest chwilowo niedostępna z powodu prac technicznych. Wprowadzamy ulepszenia, aby Artovnia była jeszcze lepszym miejscem dla twórców i miłośników rękodzieła. Wkrótce wracamy.
        </p>

        {/* Info card with artistic border */}
        <div className="relative bg-white/50 backdrop-blur-sm border border-[#3B3634]/10 p-8 mb-10">
          

          <h2 className="heading-md font-semibold text-[#3B3634] mb-4">
            Co się dzieje?
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
                <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
              </svg>
              <span>Problemy dostawcy serwerów</span>
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
                <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" />
              </svg>
              <span>Aktualizacja oprogramowania</span>
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
                <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09zM12 15l-3-3m3 3l7.5-7.5a2.12 2.12 0 00-3-3L9 12m3 3l-3-3" />
              </svg>
              <span>Ulepszanie Twojego doświadczenia</span>
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
            Spróbuj ponownie
          </button>

       
        </div>

        {/* Contact */}
        <div className="mt-14 pt-8 border-t border-[#3B3634]/10">
          <p className="text-[#3B3634]/50 text-sm mb-2">
            Jeśli problem się utrzymuje, napisz do nas:
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
          <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
          <span>Konserwacja w toku</span>
        </div>
      </div>
    </div>
  );
}