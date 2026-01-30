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

  // Parse markdown and convert to HTML
  const parseMarkdown = (text: string): string => {
    if (!text) return ''
    
    let html = text
    
    // Headers
    html = html.replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
    html = html.replace(/^## (.+)$/gm, '<h2 class="text-xl font-semibold mt-6 mb-3">$1</h2>')
    html = html.replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-8 mb-4">$1</h1>')
    
    // Bold
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    
    // Italic
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')
    
    // Strikethrough
    html = html.replace(/~~(.+?)~~/g, '<del>$1</del>')
    
    // Links
    html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>')
    
    // Blockquotes
    html = html.replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-gray-300 pl-4 italic my-2">$1</blockquote>')
    
    // Unordered lists
    html = html.replace(/^- (.+)$/gm, '<li class="ml-4">$1</li>')
    html = html.replace(/(<li class="ml-4">.+<\/li>\n?)+/g, '<ul class="list-disc list-inside my-2">$&</ul>')
    
    // Ordered lists
    html = html.replace(/^\d+\. (.+)$/gm, '<li class="ml-4">$1</li>')
    html = html.replace(/(<li class="ml-4">.+<\/li>\n?)+/g, (match) => {
      // Only wrap in <ol> if not already wrapped in <ul>
      if (match.includes('list-disc')) return match
      return `<ol class="list-decimal list-inside my-2">${match}</ol>`
    })
    
    // Paragraphs (split by double line breaks)
    const paragraphs = html.split('\n\n')
    html = paragraphs.map(para => {
      // Don't wrap if already a block element
      if (para.match(/^<(h[1-3]|ul|ol|blockquote)/)) {
        return para
      }
      // Replace single line breaks with <br>
      return `<p class="mb-4">${para.replace(/\n/g, '<br>')}</p>`
    }).join('\n')
    
    return html
  }

  return (
    <div className={`space-y-4 ${alignmentClasses[alignment]}`}>
      {heading && (
        <h2 className={headingClasses}>{heading}</h2>
      )}
      {content && (
        <div className="prose prose-lg max-w-none">
          <div dangerouslySetInnerHTML={{ __html: parseMarkdown(content) }} />
        </div>
      )}
    </div>
  )
}
