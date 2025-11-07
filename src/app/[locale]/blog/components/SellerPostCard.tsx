"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { format } from "date-fns"
import { pl } from "date-fns/locale"
import { urlFor } from "../lib/sanity"
import { SellerPost } from "../lib/data"

interface SellerPostCardProps {
  post: SellerPost
  featured?: boolean
}

export default function SellerPostCard({
  post,
  featured = false,
}: SellerPostCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const mainImageUrl = post.mainImage
    ? urlFor(post.mainImage).width(600).height(400).url()
    : "/images/placeholder.svg"

  return (
    <article
      className={`bg-primary shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 relative flex flex-col h-full w-full ${featured ? "md:col-span-2" : ""}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link
        href={`/blog/seller/${post.slug.current}`}
        className="block"
        aria-label={`Read article about ${post.sellerName}: ${post.title}`}
      >
        <div className={`relative ${featured ? "h-64" : "h-48"}`}>
          <Image
            src={mainImageUrl}
            alt={
              post.mainImage?.alt || `Featured image for ${post.sellerName}`
            }
            fill
            className="object-cover"
            sizes={
              featured
                ? "(max-width: 768px) 100vw, 50vw"
                : "(max-width: 768px) 100vw, 33vw"
            }
          />
          {post.featuredOnHomepage && (
            <div className="absolute top-4 left-4 z-10">
              <span className="bg-[#3B3634] text-white px-3 py-1 rounded-full text-sm font-medium font-instrument-sans">
                Projektant tygodnia
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
              {post.shortDescription ? (
                <>
                  <p className="text-white font-instrument-sans text-sm md:text-base mb-4 line-clamp-3 px-4">
                    {post.shortDescription}
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

      <div className="p-6 pb-10 flex-1 flex flex-col">
        <Link
          href={`/blog/seller/${post.slug.current}`}
          className="block group"
          aria-label={`Read full article: ${post.title}`}
        >
          <h3
            className={`font-semibold text-[#3B3634] group-hover:text-[#2a221f] transition-colors duration-200 mb-2 font-instrument-serif line-clamp-2 ${featured ? "text-2xl" : "text-xl"}`}
          >
            {post.title}
          </h3>
        </Link>

        {post.shortDescription && (
          <p className="text-[#3B3634] mb-4 line-clamp-3 font-instrument-sans">
            {post.shortDescription}
          </p>
        )}

        <Link
          href={`/sellers/${post.sellerHandle}`}
          className="group relative inline-block text-[#3B3634] font-instrument-sans font-medium px-3 py-1.5 overflow-hidden transition-all duration-300 hover:text-white text-sm border border-[#3B3634] mx-auto"
        >
          <span className="absolute inset-0 bg-[#3B3634] transform translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300 ease-out"></span>
          <span className="relative flex items-center gap-2">
            Odwiedź sklep
            <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </span>
        </Link>

        
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