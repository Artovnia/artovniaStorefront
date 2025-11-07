"use client"

import { useState } from "react"
import BlogPostCard from "./BlogPostCard"
import Pagination from "./Pagination"
import type { BlogPost } from "../lib/data"

const POSTS_PER_PAGE = 9

interface PaginatedBlogPostsProps {
  posts: BlogPost[]
}

export default function PaginatedBlogPosts({
  posts,
}: PaginatedBlogPostsProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE)
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE
  const endIndex = startIndex + POSTS_PER_PAGE
  const currentPosts = posts.slice(startIndex, endIndex)

  if (posts.length === 0) {
    return (
      <div
        className="text-center py-12 font-instrument-sans bg-[#F4F0EB]"
        role="status"
        aria-live="polite"
      >
        <h3 className="text-xl font-medium text-[#3B3634] mb-2">
          Nie ma jeszcze żadnych postów
        </h3>
        <p className="text-[#3B3634]">Wróć za jakiś czas!</p>
      </div>
    )
  }

  return (
    <section
      className="font-instrument-sans bg-[#F4F0EB]"
      aria-labelledby="all-posts-heading"
    >
      <h2
        id="all-posts-heading"
        className="text-2xl lg:text-3xl xl:text-4xl text-[#3B3634] mb-6 font-instrument-serif"
      >
        Wszystkie posty
      </h2>
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr"
        role="list"
      >
        {currentPosts.map((post) => (
          <div key={post._id} role="listitem" className="flex w-full">
            <BlogPostCard post={post} />
          </div>
        ))}
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        ariaLabel="Nawigacja postów blogowych"
      />
    </section>
  )
}