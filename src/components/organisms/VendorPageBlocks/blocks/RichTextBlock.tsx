'use client'

interface RichTextBlockData {
  heading?: string
  content: string
  alignment: 'left' | 'center' | 'right'
}

interface RichTextBlockProps {
  data: RichTextBlockData
}

export const RichTextBlock = ({ data }: RichTextBlockProps) => {
  const { heading, content, alignment = 'left' } = data

  // Don't render empty rich text blocks (but allow heading-only)
  if ((!content || content.trim() === '') && (!heading || heading.trim() === '')) {
    return null
  }

  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  }

  return (
    <div className={`space-y-4 ${alignmentClasses[alignment]}`}>
      {heading && (
        <h2 className="text-2xl md:text-3xl font-instrument-serif italic text-[#3B3634]">{heading}</h2>
      )}
      {content && (
        <div className="prose prose-lg max-w-none">
          <div dangerouslySetInnerHTML={{ __html: content }} />
        </div>
      )}
    </div>
  )
}
