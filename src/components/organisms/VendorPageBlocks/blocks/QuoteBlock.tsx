'use client'

interface QuoteBlockData {
  quote: string
  author?: string
  author_title?: string
}

interface QuoteBlockProps {
  data: QuoteBlockData
}

export const QuoteBlock = ({ data }: QuoteBlockProps) => {
  const { quote, author, author_title } = data

  // Don't render empty quote blocks
  if (!quote || quote.trim() === '') {
    return null
  }

  return (
    <div className="p-8 md:p-12 bg-[#F4F0EB] rounded-lg text-center">
      {/* Quote icon */}
      <svg className="w-10 h-10 md:w-12 md:h-12 mx-auto text-[#3B3634]/40 mb-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
      </svg>
      <blockquote className="text-xl md:text-2xl italic text-[#3B3634] mb-4 font-instrument-serif">
        &ldquo;{quote}&rdquo;
      </blockquote>
      {(author || author_title) && (
        <footer className="text-[#3B3634]/70">
          {author && <span className="font-medium">{author}</span>}
          {author && author_title && <span className="mx-2">—</span>}
          {author_title && <span>{author_title}</span>}
        </footer>
      )}
    </div>
  )
}
