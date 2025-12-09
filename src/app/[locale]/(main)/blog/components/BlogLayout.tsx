import { Suspense } from "react"
import Image from "next/image"
import { SafeI18nLink as Link } from "@/components/atoms/SafeI18nLink"
import { Breadcrumbs } from "@/components/atoms/Breadcrumbs/Breadcrumbs"
import BlogSearch from "./BlogSearch"
import NewsletterSection from "@/components/sections/NewsletterSection/NewsletterSection"
import type { BlogCategory } from "../lib/data"

interface BlogLayoutProps {
  children: React.ReactNode
  title?: string
  description?: string
  breadcrumbs?: { label: string; path: string }[]
  categories: BlogCategory[]
}

/**
 * BlogLayout - Blog-specific content wrapper
 * NOTE: Does NOT render Header/Footer - those come from parent layout
 * Only renders blog hero section, breadcrumbs, navigation, and content wrapper
 */
export default function BlogLayout({
  children,
  title,
  description,
  breadcrumbs,
  categories,
}: BlogLayoutProps) {
  return (
    <div className="min-h-screen bg-[#F4F0EB]" lang="pl">

      {/* Hero Section with Image and Overlay */}
      <section
        className="relative w-full h-[300px] sm:h-[350px] md:h-[350px] lg:h-[400px] xl:h-[400px] overflow-hidden bg-[#F4F0EB]"
        aria-labelledby="blog-heading"
      >
        {/* Background Image */}
        <div className="absolute inset-0 bg-[#F4F0EB]" aria-hidden="true">
          <Image
            src="/images/blog/blogHeader.webp"
            alt=""
            fill
            priority
            fetchPriority="high"
            loading="eager"
            className="object-cover object-[center] 2xl:object-contain"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1920px"
            quality={90}
            placeholder="blur"
            blurDataURL="data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA="
          />
        </div>

        {/* Content Overlay */}
        <div className="relative h-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center h-full text-center">
            {/* Main Heading */}
            <h1
              id="blog-heading"
              className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-instrument-serif italic font-normal text-white mb-4 sm:mb-6 drop-shadow-2xl"
            >
              {title || "Blog"}
            </h1>

            {/* Subtitle */}
            {description && (
              <p className="text-md sm:text-lg md:text-xl lg:text-xl text-white font-instrument-sans max-w-3xl drop-shadow-lg uppercase">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Skip to content link for keyboard navigation */}
        <a
          href="#blog-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-[#3B3634] focus:rounded focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#3B3634] focus:ring-offset-2"
        >
          Przejdź do treści bloga
        </a>
      </section>

      {/* Main Content Container */}
      <div className="max-w-[1400px] mx-auto" id="blog-content">
        {/* Breadcrumbs */}
        {breadcrumbs && (
          <nav
            className="bg-[#F4F0EB] px-4 lg:px-8 py-4"
            aria-label="Ścieżka nawigacji"
          >
            <Breadcrumbs items={breadcrumbs} />
          </nav>
        )}

        {/* Search Bar */}
        <div className="bg-[#F4F0EB]">
          <div className="px-4 sm:px-6 lg:px-8 ">
            <div className="flex items-center justify-end">
              <div className="w-full max-w-md">
                <Suspense fallback={
                  <div className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                }>
                  <BlogSearch />
                </Suspense>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav
          className="bg-[#F4F0EB] border-b"
          aria-label="Kategorie bloga"
        >
          <div className="px-4 sm:px-6 lg:px-8">
            <ul
              className="flex space-x-8 overflow-x-auto py-4 border-b border-[#3B3634]/50"
              role="list"
            >
              <li>
                <Link
                  href="/blog"
                  className="whitespace-nowrap text-sm font-medium text-[#3B3634] border-b-2 border-transparent hover:bg-[#3B3634] hover:text-white p-2 font-instrument-sans transition-colors duration-200 inline-block"
                  aria-current="page"
                >
                  Wszystkie posty
                </Link>
              </li>
              <li>
                <Link
                  href="/blog#artists"
                  className="whitespace-nowrap text-sm font-medium text-[#3B3634] border-b-2 border-transparent hover:bg-[#3B3634] hover:text-white p-2 font-instrument-sans transition-colors duration-200 inline-block"
                >
                  Poznaj artystów
                </Link>
              </li>
              {categories.map((category) => (
                <li key={category.slug.current}>
                  <Link
                    href={`/blog/category/${category.slug.current}`}
                    className="whitespace-nowrap text-sm font-medium text-[#3B3634] hover:text-white hover:bg-[#3B3634] border-b-2 border-transparent p-2 font-instrument-sans transition-colors duration-200 inline-block"
                  >
                    {category.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>

      {/* Newsletter Section */}
      <NewsletterSection />
      
      {/* Note: Footer is rendered by parent layout, not here */}
    </div>
  )
}