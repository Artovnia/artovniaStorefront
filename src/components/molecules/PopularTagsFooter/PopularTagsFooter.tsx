'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Tag {
  value: string
  slug: string
  count: number
}

export function PopularTagsFooter() {
  const [tags, setTags] = useState<Tag[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Load tags after page is fully loaded
    const loadTags = async () => {
      try {
        const response = await fetch('/api/popular-tags')
        if (response.ok) {
          const data = await response.json()
          setTags(data.tags.slice(0, 8)) // Top 8 tags for footer
          setIsLoaded(true)
        }
      } catch (error) {
        console.error('Error loading popular tags:', error)
      }
    }

    // Wait for page to be fully loaded before fetching
    if (document.readyState === 'complete') {
      loadTags()
    } else {
      window.addEventListener('load', loadTags)
      return () => window.removeEventListener('load', loadTags)
    }
  }, [])

  if (!isLoaded || tags.length === 0) {
    return null
  }

  return (
    <div>
      <h2 className="text-white font-instrument-sans font-normal text-lg mb-6 uppercase">
        Popularne tagi
      </h2>
      <nav className="space-y-3 font-instrument-sans uppercase">
        {tags.map((tag) => (
          <Link
            key={tag.slug}
            href={`/tags/${tag.slug}`}
            className="block text-white hover:text-primary transition-colors duration-200 text-sm"
          >
            {tag.value}
          </Link>
        ))}
        <Link
          href="/tags"
          className="block text-white hover:text-primary transition-colors duration-200 text-sm opacity-75"
        >
          Wszystkie tagi →
        </Link>
      </nav>
    </div>
  )
}
