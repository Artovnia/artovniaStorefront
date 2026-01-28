'use client'

interface RichTextBlockData {
  heading?: string
  heading_alignment?: 'left' | 'center' | 'right'
  heading_italic?: boolean
  content: string
  alignment: 'left' | 'center' | 'right'
}

interface RichTextBlockProps {
  data: RichTextBlockData
}

export const RichTextBlock = ({ data }: RichTextBlockProps) => {
  const { 
    heading, 
    heading_alignment = 'left',
    heading_italic = false,
    content, 
    alignment = 'left' 
  } = data

  const headingAlignmentClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  }

  const headingClasses = `text-2xl md:text-3xl font-instrument-serif mb-4 ${headingAlignmentClasses[heading_alignment]} ${heading_italic ? 'italic' : ''}`

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
        <h2 className={headingClasses}>{heading}</h2>
      )}
      {content && (
        <div className="prose prose-lg max-w-none">
          <div dangerouslySetInnerHTML={{ __html: content }} />
        </div>
      )}
    </div>
  )
}
