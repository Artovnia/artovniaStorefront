"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { format } from "date-fns"
import { pl } from "date-fns/locale"
import { urlFor } from "../lib/sanity"
import { BlogPost } from "../lib/data"

interface BlogPostCardProps {
  post: BlogPost
  featured?: boolean
}

export default function BlogPostCard({
  post,
  featured = false,
}: BlogPostCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const imageUrl = post.mainImage
    ? urlFor(post.mainImage).width(600).height(400).url()
    : "/images/placeholder.svg"

  return (
    <article
      className={`bg-primary shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 relative flex flex-col h-full w-full ${featured ? "md:col-span-2" : ""}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link
        href={`/blog/${post.slug.current}`}
        className="block"
        prefetch={true}
        aria-label={`Read article: ${post.title}`}
      >
        <div className={`relative ${featured ? "h-64" : "h-48"}`}>
          <Image
            src={imageUrl}
            alt={post.mainImage?.alt || `Featured image for ${post.title}`}
            fill
            className="object-cover"
            sizes={
              featured
                ? "(max-width: 768px) 100vw, 50vw"
                : "(max-width: 768px) 100vw, 33vw"
            }
          />

          {post.featured && (
            <div className="absolute top-4 left-4 z-10">
              <span className="text-white px-3 py-1 text-sm font-medium font-instrument-sans bg-black/70 rounded">
                Wyróżnione
              </span>
            </div>
          )}

          {/* Hover Overlay */}
          <div
            className={`absolute inset-0 bg-gradient-to-t from-[#3B3634]/95 via-[#3B3634]/70 to-transparent transition-opacity duration-500 flex flex-col items-center justify-center p-6 ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
            aria-hidden="true"
          >
            <div
              className="text-center transform transition-transform duration-500 w-full"
              style={{
                transform: isHovered ? "translateY(0)" : "translateY(20px)",
              }}
            >
              {post.excerpt ? (
                <>
                  <p className="text-white font-instrument-sans text-sm md:text-base mb-4 line-clamp-3 px-4">
                    {post.excerpt}
                  </p>
                  <span className="text-white font-instrument-serif text-lg md:text-xl lg:text-2xl flex items-center gap-3 justify-center">
                    Czytaj więcej
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </span>
                </>
              ) : (
                <span className="text-white font-instrument-serif text-lg md:text-xl lg:text-2xl flex items-center gap-3 justify-center">
                  Czytaj więcej
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>

      <div className="p-4 pb-10 flex-1 flex flex-col">
        {post.categories && post.categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {post.categories.map((category) => (
              <Link
                key={category.slug.current}
                href={`/blog/category/${category.slug.current}`}
                className="text-xs font-medium bg-blue-50 px-2 py-1 rounded font-instrument-sans hover:bg-blue-100 transition-colors"
              >
                {category.title}
              </Link>
            ))}
          </div>
        )}

        <Link
          href={`/blog/${post.slug.current}`}
          className="block group"
          aria-label={`Read full article: ${post.title}`}
        >
          <h3
            className={`font-semibold text-[#3B3634] group-hover:text-[#2a221f] transition-colors duration-200 mb-2 font-instrument-serif line-clamp-2 ${featured ? "text-2xl" : "text-xl"}`}
          >
            {post.title}
          </h3>
        </Link>

        {post.author && (
          <div className="flex items-center space-x-2 text-sm text-gray-500 font-instrument-sans mb-2">
            {post.author.image && (
              <div className="relative w-8 h-8 flex-shrink-0">
                <Image
                  src={urlFor(post.author.image).width(32).height(32).url()}
                  alt={post.author.name}
                  fill
                  className="rounded-full object-cover"
                />
              </div>
            )}
            <span>{post.author.name}</span>
          </div>
        )}

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-auto pt-4">
            {post.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded font-instrument-sans"
              >
                #{tag}
              </span>
            ))}
            {post.tags.length > 3 && (
              <span className="text-xs text-gray-500 font-instrument-sans">
                +{post.tags.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Fixed datetime in bottom-right corner of entire card */}
      <time
        dateTime={post.publishedAt}
        className="absolute bottom-2 right-2 text-sm text-gray-500 font-instrument-sans bg-primary px-2 py-1 rounded"
      >
        {format(new Date(post.publishedAt), "dd MMM yyyy", { locale: pl })}
      </time>
    </article>
  )
}