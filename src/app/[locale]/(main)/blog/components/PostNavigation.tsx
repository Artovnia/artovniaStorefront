'use client'

import Link from 'next/link'
import Image from 'next/image'
import { urlFor } from '../lib/sanity'
import type { BlogPost } from '../lib/data'

interface PostNavigationProps {
  previousPost: BlogPost | null
  nextPost: BlogPost | null
}

/**
 * PostNavigation - Navigation between blog posts (previous/next)
 * Improves internal linking for SEO and user experience
 */
export default function PostNavigation({ previousPost, nextPost }: PostNavigationProps) {
  if (!previousPost && !nextPost) {
    return null
  }

  return (
    <nav 
      className="mt-12 pt-8 border-t border-[#BFB7AD]/30"
      aria-label="Nawigacja między wpisami"
    >
      <h2 className="sr-only">Nawigacja między wpisami</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Previous Post */}
        {previousPost ? (
          <Link
            href={`/blog/${previousPost.slug.current}`}
            className="group flex items-center gap-4 p-4 bg-primary rounded-lg border border-[#BFB7AD]/30 hover:border-[#3B3634] hover:shadow-md transition-all duration-300"
            aria-label={`Poprzedni wpis: ${previousPost.title}`}
          >
            <div className="flex-shrink-0">
              <svg 
                className="w-6 h-6 text-[#3B3634]  transition-colors" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </div>
            
            {previousPost.mainImage && (
              <div className="relative w-16 h-16 flex-shrink-0 rounded overflow-hidden">
                <Image
                  src={urlFor(previousPost.mainImage).width(64).height(64).url()}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <span className="text-xs text-[#3B3634] font-instrument-sans uppercase tracking-wide">
                Poprzedni wpis
              </span>
              <h3 className="text-sm md:text-base font-medium text-[#3B3634] font-instrument-serif line-clamp-2  transition-colors">
                {previousPost.title}
              </h3>
            </div>
          </Link>
        ) : (
          <div className="hidden md:block" aria-hidden="true" />
        )}

        {/* Next Post */}
        {nextPost ? (
          <Link
            href={`/blog/${nextPost.slug.current}`}
            className="group flex items-center gap-4 p-4 bg-primary rounded-lg border border-[#BFB7AD]/30 hover:border-[#3B3634] hover:shadow-md transition-all duration-300 md:flex-row-reverse md:text-right"
            aria-label={`Następny wpis: ${nextPost.title}`}
          >
            <div className="flex-shrink-0">
              <svg 
                className="w-6 h-6 text-[#3b3634]  transition-colors" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            
            {nextPost.mainImage && (
              <div className="relative w-16 h-16 flex-shrink-0 rounded overflow-hidden">
                <Image
                  src={urlFor(nextPost.mainImage).width(64).height(64).url()}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <span className="text-xs text-[#3b3634] font-instrument-sans uppercase tracking-wide">
                Następny wpis
              </span>
              <h3 className="text-sm md:text-base font-medium text-[#3B3634] font-instrument-serif line-clamp-2 transition-colors">
                {nextPost.title}
              </h3>
            </div>
          </Link>
        ) : (
          <div className="hidden md:block" aria-hidden="true" />
        )}
      </div>
    </nav>
  )
}
