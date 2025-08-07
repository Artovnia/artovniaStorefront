import Link from 'next/link'
import { getBlogCategories } from '../lib/data'
import BlogSearch from './BlogSearch'
import { Footer } from '@/components/organisms/Footer/Footer'

interface BlogLayoutProps {
  children: React.ReactNode
  title?: string
  description?: string
}

export default async function BlogLayout({ children, title, description }: BlogLayoutProps) {
  const categories = await getBlogCategories()

  return (
    <div className="min-h-screen bg-[#F4F0EB]">
      {/* Header */}
      <header className="bg-[#F4F0EB] shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-600 hover:text-gray-900">
                ← Back to Store
              </Link>
              <div className="h-6 border-l border-gray-300"></div>
              <Link href="/blog" className="text-xl font-bold text-gray-900">
                Blog
              </Link>
            </div>
            <div className="flex-1 max-w-md mx-4">
              <BlogSearch />
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-[#F4F0EB] border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto py-4">
            <Link
              href="/blog"
              className="whitespace-nowrap text-sm font-medium text-gray-600 hover:text-gray-900 border-b-2 border-transparent hover:border-gray-300 pb-2"
            >
              All Posts
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

      {/* Footer */}
      <Footer />
    </div>
  )
}
