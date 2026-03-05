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
      {/* Decorative background elements */}
      <div className="pointer-events-none absolute inset-0">
        {/* Watercolor-style blobs */}
        <svg
          className="absolute -top-20 -left-20 w-96 h-96 opacity-[0.07]"
          viewBox="0 0 400 400"
          fill="none"
        >
          <path
            d="M200 50c80 0 150 60 150 150s-70 150-150 150S50 280 50 200c0-40 20-80 50-110 10-10 30-20 40-25 20-10 40-15 60-15z"
            fill="#3B3634"
          />
        </svg>
        <svg
          className="absolute -bottom-32 -right-20 w-[500px] h-[500px] opacity-[0.05]"
          viewBox="0 0 400 400"
          fill="none"
        >
          <path
            d="M180 30c90 10 180 80 190 170s-50 170-140 180S50 310 40 220 90 20 180 30z"
            fill="#3B3634"
          />
        </svg>
        <svg
          className="absolute top-1/4 -right-10 w-72 h-72 opacity-[0.04]"
          viewBox="0 0 300 300"
          fill="none"
        >
          <circle cx="150" cy="150" r="140" fill="#3B3634" />
        </svg>

        {/* Scattered brush stroke accents */}
        <svg
          className="absolute top-20 right-[15%] w-32 h-8 opacity-[0.08]"
          viewBox="0 0 200 30"
          fill="none"
        >
          <path
            d="M5 15c30-8 60-12 95-10s70 8 95 10"
            stroke="#3B3634"
            strokeWidth="6"
            strokeLinecap="round"
          />
        </svg>
        <svg
          className="absolute bottom-32 left-[10%] w-24 h-6 opacity-[0.06]"
          viewBox="0 0 200 30"
          fill="none"
        >
          <path
            d="M5 15c40-10 80-10 120-5s55 8 70 5"
            stroke="#3B3634"
            strokeWidth="8"
            strokeLinecap="round"
          />
        </svg>

        {/* Tiny decorative dots like paint splatters */}
        {[
          { top: "15%", left: "8%", size: "w-2 h-2" },
          { top: "25%", left: "85%", size: "w-1.5 h-1.5" },
          { top: "70%", left: "5%", size: "w-1 h-1" },
          { top: "80%", left: "90%", size: "w-2.5 h-2.5" },
          { top: "45%", left: "3%", size: "w-1 h-1" },
          { top: "55%", left: "95%", size: "w-1.5 h-1.5" },
        ].map((dot, i) => (
          <div
            key={i}
            className={`absolute rounded-full bg-[#3B3634]/[0.08] ${dot.size}`}
            style={{ top: dot.top, left: dot.left }}
          />
        ))}
      </div>

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

        {/* Artistic illustration — easel with paint palette */}
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
            {/* Canvas inner border */}
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

            {/* Abstract art strokes on canvas */}
            <path
              d="M75 55c10-8 20-5 30 2s15 12 25 5"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              opacity="0.15"
            />
            <path
              d="M70 75c15 5 25 0 35-5s20-8 25 0"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              opacity="0.1"
            />
            <path
              d="M80 95c8-3 18 5 25 2s12-6 20-2"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              opacity="0.12"
            />
            {/* Little paint dots on canvas */}
            <circle cx="85" cy="45" r="3" fill="currentColor" opacity="0.08" />
            <circle
              cx="110"
              cy="85"
              r="4"
              fill="currentColor"
              opacity="0.06"
            />
            <circle
              cx="95"
              cy="110"
              r="2.5"
              fill="currentColor"
              opacity="0.1"
            />

            {/* Wrench/gear icon on canvas center — maintenance hint */}
            <g opacity="0.25" transform="translate(88, 58)">
              <path
                d="M12 2C11.2 2 10.4 2.1 9.7 2.4L12 4.7V7.3L9.7 9.6C10.4 9.9 11.2 10 12 10C15.3 10 18 7.8 18 5C18 4.2 17.8 3.5 17.5 2.8L15.2 5.1H12.6L10.3 2.8C10.9 2.3 11.4 2 12 2Z"
                stroke="currentColor"
                strokeWidth="1.2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
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
            {/* Palette hole */}
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
            {/* Paint blobs on palette */}
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

            {/* Paintbrush leaning on easel */}
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
            {/* Brush tip */}
            <path
              d="M139.5 40l1-8c0-2 1.5-3 1.5-3s1.5 1 1.5 3l-1 8"
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
          Tworzymy coś pięknego
        </h1>

        {/* Description */}
        <p className="text-lg sm:text-xl text-[#3B3634]/70 mb-10 max-w-lg mx-auto leading-relaxed">
          Nasza pracownia jest chwilowo zamknięta na konserwację. Pracujemy nad
          tym, aby wrócić z jeszcze lepszym doświadczeniem.
        </p>

        {/* Info card with artistic border */}
        <div className="relative bg-white/50 backdrop-blur-sm border border-[#3B3634]/10 p-8 mb-10">
          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[#3B3634]/20" />
          <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-[#3B3634]/20" />
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-[#3B3634]/20" />
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[#3B3634]/20" />

          <h2 className="text-lg font-semibold text-[#3B3634] mb-4">
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
              <span>Planowana konserwacja systemu</span>
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

          <p className="text-sm text-[#3B3634]/40">
            Pracujemy nad tym{dots}
          </p>
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