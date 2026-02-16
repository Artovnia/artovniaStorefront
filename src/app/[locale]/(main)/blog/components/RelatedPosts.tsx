'use client'

import Link from 'next/link'
import Image from 'next/image'
import { urlFor } from '../lib/sanity'
import type { BlogPost } from '../lib/data'

interface RelatedPostsProps {
  posts: BlogPost[]
  currentPostId: string
}

/**
 * RelatedPosts - Shows related blog posts for better internal linking
 * Improves SEO by creating more internal links and keeping users on site
 */
export default function RelatedPosts({ posts, currentPostId }: RelatedPostsProps) {
  // Filter out current post and limit to 3
  const relatedPosts = posts
    .filter(post => post._id !== currentPostId)
    .slice(0, 3)

  if (relatedPosts.length === 0) {
    return null
  }

  return (
    <section 
      className="mt-12 pt-8 border-t border-[#BFB7AD]/30"
      aria-labelledby="related-posts-heading"
    >
      <h2 
        id="related-posts-heading"
        className="text-2xl md:text-3xl font-instrument-serif text-[#3B3634] mb-6"
      >
        Może Cię również zainteresować
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" role="list">
        {relatedPosts.map((post) => {
          let imageUrl: string | null = null
          try {
            imageUrl = post.mainImage ? urlFor(post.mainImage).width(400).height(250).url() : null
          } catch {
            // Ignore image errors
          }

          return (
            <article 
              key={post._id} 
              role="listitem"
              className="group bg-primary overflow-hidden border border-[#BFB7AD]/30 hover:border-[#3B3634] hover:shadow-lg transition-all duration-300"
            >
              <Link
                href={`/blog/${post.slug.current}`}
                className="block"
                aria-label={`Czytaj: ${post.title}`}
              >
                {imageUrl && (
                  <div className="relative h-40 overflow-hidden">
                    <Image
                      src={imageUrl}
                      alt={post.mainImage?.alt || post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                )}
                
                <div className="p-4">
                  {post.categories && post.categories.length > 0 && (
                    <span className="text-xs text-[#BFB7AD] font-instrument-sans uppercase tracking-wide">
                      {post.categories[0].title}
                    </span>
                  )}
                  
                  <h3 className="text-base md:text-lg font-medium text-[#3B3634] font-instrument-serif line-clamp-2 mt-1 transition-colors">
                    {post.title}
                  </h3>
                  
                  {post.excerpt && (
                    <p className="text-sm text-[#3B3634]/70 font-instrument-sans line-clamp-2 mt-2">
                      {post.excerpt}
                    </p>
                  )}
                </div>
              </Link>
            </article>
          )
        })}
      </div>

      {/* SEO: Link back to blog listing */}
      <div className="mt-8 text-center">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-[#3B3634] font-instrument-sans font-medium px-3 py-1.5 overflow-hidden transition-all duration-300 hover:text-white hover:bg-[#3B3634] text-sm border border-[#3B3634] mx-auto"
        >
          <span>Zobacz wszystkie wpisy</span>
          <svg 
            className="w-4 h-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </section>
  )
}
