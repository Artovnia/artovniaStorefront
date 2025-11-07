"use client"

import { useState } from "react"
import SellerPostCard from "./SellerPostCard"
import Pagination from "./Pagination"
import type { SellerPost } from "../lib/data"

const SELLER_POSTS_PER_PAGE = 6

interface PaginatedSellerPostsProps {
  posts: SellerPost[]
}

export default function PaginatedSellerPosts({
  posts,
}: PaginatedSellerPostsProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = Math.ceil(posts.length / SELLER_POSTS_PER_PAGE)
  const startIndex = (currentPage - 1) * SELLER_POSTS_PER_PAGE
  const endIndex = startIndex + SELLER_POSTS_PER_PAGE
  const currentPosts = posts.slice(startIndex, endIndex)

  if (posts.length === 0) {
    return null
  }

  return (
    <section
      id="artists"
      className="font-instrument-sans bg-[#F4F0EB] mt-12 scroll-mt-20"
      aria-labelledby="artists-heading"
    >
      <h2
        id="artists-heading"
        className="text-2xl lg:text-3xl xl:text-4xl text-[#3B3634] mb-6 font-instrument-serif"
      >
        Poznaj artystów
      </h2>
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr"
        role="list"
      >
        {currentPosts.map((post) => (
          <div key={post._id} role="listitem" className="flex w-full">
            <SellerPostCard post={post} />
          </div>
        ))}
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        ariaLabel="Nawigacja postów artystów"
      />
    </section>
  )
}