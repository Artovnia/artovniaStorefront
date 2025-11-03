'use client'

import { useState } from 'react'
import BlogPostCard from './BlogPostCard'
import Pagination from './Pagination'
import type { BlogPost } from '../lib/data'

const POSTS_PER_PAGE = 9

interface PaginatedBlogPostsProps {
  posts: BlogPost[]
}

export default function PaginatedBlogPosts({ posts }: PaginatedBlogPostsProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE)
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE
  const endIndex = startIndex + POSTS_PER_PAGE
  const currentPosts = posts.slice(startIndex, endIndex)

  if (posts.length === 0) {
    return (
      <div className="text-center py-12 font-instrument-sans bg-[#F4F0EB]">
        <h3 className="text-xl font-medium text-[#3B3634] mb-2">Nie ma jeszcze żadnych postów</h3>
        <p className="text-[#3B3634]">Wróć za jakiś czas!</p>
      </div>
    )
  }

  return (
    <section className="font-instrument-sans bg-[#F4F0EB]">
      <h2 className="text-2xl font-semibold text-[#3B3634] mb-6 font-instrument-serif">Wszystkie posty</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentPosts.map((post) => (
          <BlogPostCard key={post._id} post={post} />
        ))}
      </div>
      <Pagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </section>
  )
}
