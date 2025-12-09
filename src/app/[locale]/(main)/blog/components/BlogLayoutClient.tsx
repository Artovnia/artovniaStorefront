'use client'

import Link from 'next/link'
import BlogSearchWrapper from './BlogSearchWrapper'
import { Footer } from '@/components/organisms/Footer/Footer'
import { Header } from '@/components/organisms/Header/Header'
import { Breadcrumbs } from '@/components/atoms/Breadcrumbs/Breadcrumbs'
import NewsletterSection from '@/components/sections/NewsletterSection/NewsletterSection'
import type { BlogCategory } from '../lib/data'

interface BlogLayoutClientProps {
  children: React.ReactNode
  title?: string
  description?: string
  breadcrumbs?: { label: string; path: string }[]
  categories: BlogCategory[]
}

export default function BlogLayoutClient({ 
  children, 
  title, 
  description, 
  breadcrumbs,
  categories 
}: BlogLayoutClientProps) {
  return (
    <div className="min-h-screen bg-[#F4F0EB] ">
      {/* Main Site Header */}
      <Header />
      
      {/* Breadcrumbs */}
      {breadcrumbs && (
        <div className="bg-[#F4F0EB] px-4 lg:px-8 py-4">
          <div className="max-w-7xl mx-auto mt-12 xl:mt-20">
            <Breadcrumbs items={breadcrumbs} />
          </div>
        </div>
      )}

      {/* Blog-specific Header */}
      <div className="bg-[#F4F0EB] shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            <div className="flex-1 max-w-md mx-4">
              <BlogSearchWrapper />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="bg-[#F4F0EB] border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto py-4">
            <Link
              href="/blog"
              className="whitespace-nowrap text-sm font-medium text-gray-600 hover:text-gray-900 border-b-2 border-transparent hover:border-gray-300 pb-2"
            >
              Wszystkie posty
            </Link>
            <Link
              href="/blog#artists"
              className="whitespace-nowrap text-sm font-medium text-purple-600 hover:text-purple-900 border-b-2 border-transparent hover:border-purple-300 pb-2"
            >
              Poznaj artystów
            </Link>
            {categories.map((category) => (
              <Link
                key={category.slug.current}
                href={`/blog/category/${category.slug.current}`}
                className="whitespace-nowrap text-sm font-medium text-gray-600 hover:text-gray-900 border-b-2 border-transparent hover:border-gray-300 pb-2"
              >
                {category.title}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Page Header */}
      {(title || description) && (
        <div className="bg-[#F4F0EB]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {title && (
              <h1 className="text-3xl font-bold text-gray-900 mb-2 font-instrument-serif">{title}</h1>
            )}
            {description && (
              <p className="text-lg text-gray-600 font-instrument-sans">{description}</p>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <NewsletterSection/>
      {/* Footer */}
      <Footer />
    </div>
  )
}
