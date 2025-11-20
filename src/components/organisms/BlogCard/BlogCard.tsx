"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { BlogPost } from "@/app/[locale]/blog/lib/data"
import { urlFor } from "@/app/[locale]/blog/lib/sanity"
import { ArrowRightIcon } from "@/icons"
import { format } from "date-fns"
import { pl } from "date-fns/locale"

interface BlogCardProps {
  post: BlogPost
  index: number
}

export function BlogCard({ post, index }: BlogCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const imageUrl = post.mainImage
    ? urlFor(post.mainImage).width(467).height(472).url()
    : "/images/placeholder.svg"

  const categoryName =
    post.categories && post.categories.length > 0
      ? post.categories[0].title.toUpperCase()
      : "BLOG"

  return (
    <Link
      href={`/blog/${post.slug.current}`}
      className="group block border border-secondary p-1 relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label={`Read article: ${post.title}`}
    >
      <article className="relative overflow-hidden h-full">
        <Image
          src={imageUrl}
          alt={post.mainImage?.alt || `Featured image for ${post.title}`}
          width={467}
          height={472}
          className="object-cover max-h-[472px] h-full w-full"
          priority={index === 0}
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
        />

        {/* Category badge */}
        <div className="absolute top-4 left-4">
          <span className="bg-black text-white px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide">
            {categoryName}
          </span>
        </div>

        {/* Date badge - Hidden on small screens to prevent overlap */}
        <div className="absolute top-4 right-4 hidden sm:block">
          <time
            dateTime={post.publishedAt}
            className="bg-white/90 text-black px-3 py-1 rounded-full text-xs font-medium block"
          >
            {format(new Date(post.publishedAt), "dd MMM yyyy", { locale: pl })}
          </time>
        </div>

        {/* Hover Overlay */}
        <div
          className={`absolute inset-0 bg-gradient-to-t from-[#3B3634]/95 via-[#3B3634]/70 to-transparent transition-opacity duration-500 flex items-center justify-center ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden="true"
        >
          <div
            className="text-center px-4 flex flex-col items-center gap-4 transform transition-transform duration-500"
            style={{
              transform: isHovered ? "translateY(0)" : "translateY(20px)",
            }}
          >
            {post.excerpt && (
              <p className="text-white text-sm md:text-md xl:text-lg line-clamp-3 font-instrument-sans">
                {post.excerpt}
              </p>
            )}
            <span className="text-white font-instrument-serif text-xl md:text-2xl lg:text-3xl flex items-center gap-3">
              Czytaj więcej
              <ArrowRightIcon size={24} color="white" aria-hidden="true" />
            </span>
          </div>
        </div>

        {/* Permanent title section */}
        <div className="py-2 px-4 bg-tertiary text-tertiary absolute bottom-0 w-full min-h-[4rem] max-h-[4rem] overflow-hidden transition-all duration-300">
          <h3 className="heading-sm lg:heading-md font-instrument-serif line-clamp-2">
            {post.title}
          </h3>
        </div>
      </article>
    </Link>
  )
}