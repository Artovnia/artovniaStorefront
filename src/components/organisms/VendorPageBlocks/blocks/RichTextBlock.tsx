'use client'

import { useMemo } from 'react'

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

/**
 * Detect whether content is HTML (new content from TipTap editor)
 * vs legacy markdown or plain text.
 */
const isHtmlContent = (text: string): boolean => {
  if (!text || !text.trim()) return false
  const trimmed = text.trim()
  return /^<[a-z][^>]*>/i.test(trimmed) ||
    /<(p|h[1-6]|ul|ol|li|blockquote|pre|div|strong|em|u|s|del|a|table)\b/i.test(trimmed)
}

/**
 * Convert legacy markdown to HTML via regex.
 * Only used for old content that was stored as markdown.
 */
const parseMarkdown = (text: string): string => {
  if (!text) return ''
  
  let html = text
  
  // Headers
  html = html.replace(/^#### (.+)$/gm, '<h4>$1</h4>')
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>')
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>')
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>')
  
  // Bold + Italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  // Italic
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')
  html = html.replace(/_(.+?)_/g, '<em>$1</em>')
  
  // Strikethrough
  html = html.replace(/~~(.+?)~~/g, '<del>$1</del>')
  
  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>')
  
  // Links
  html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
  
  // Blockquotes
  html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
  
  // Unordered lists
  html = html.replace(/^[-*+] (.+)$/gm, '<li>$1</li>')
  
  // Ordered lists
  html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
  
  // Wrap consecutive <li> in <ul> or <ol>
  html = html.replace(/(<li>.+<\/li>\n?)+/g, (match) => {
    return `<ul>${match}</ul>`
  })
  
  // Paragraphs (split by double line breaks)
  const paragraphs = html.split('\n\n')
  html = paragraphs.map(para => {
    if (para.match(/^<(h[1-4]|ul|ol|blockquote)/)) {
      return para
    }
    return `<p>${para.replace(/\n/g, '<br>')}</p>`
  }).join('\n')
  
  return html
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

  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  }

  const isHtml = useMemo(() => content ? isHtmlContent(content) : false, [content])

  // For HTML content, render directly. For legacy markdown, convert first.
  const renderedHtml = useMemo(() => {
    if (!content) return ''
    return isHtml ? content : parseMarkdown(content)
  }, [content, isHtml])

  // Don't render empty rich text blocks (but allow heading-only)
  if ((!content || content.trim() === '') && (!heading || heading.trim() === '')) {
    return null
  }

  return (
    <div className={`space-y-4 ${alignmentClasses[alignment]}`}>
      {heading && (
        <h2 className={headingClasses}>{heading}</h2>
      )}
      {content && (
        <div
          className="storefront-richtext-html prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: renderedHtml }}
        />
      )}
      <style>{`
        .storefront-richtext-html p { margin-bottom: 1rem; line-height: 1.75; }
        .storefront-richtext-html strong { font-weight: 700; }
        .storefront-richtext-html em { font-style: italic; }
        .storefront-richtext-html u { text-decoration: underline; }
        .storefront-richtext-html s,
        .storefront-richtext-html del { text-decoration: line-through; color: #6b7280; }
        .storefront-richtext-html h1 { font-size: 1.875rem; font-weight: 700; margin: 1.5rem 0 0.75rem; }
        .storefront-richtext-html h2 { font-size: 1.5rem; font-weight: 700; margin: 1.25rem 0 0.5rem; }
        .storefront-richtext-html h3 { font-size: 1.25rem; font-weight: 600; margin: 1rem 0 0.5rem; }
        .storefront-richtext-html h4 { font-size: 1.125rem; font-weight: 600; margin: 0.75rem 0 0.5rem; }
        .storefront-richtext-html ul { list-style-type: disc; margin-left: 1.5rem; margin-bottom: 1rem; }
        .storefront-richtext-html ol { list-style-type: decimal; margin-left: 1.5rem; margin-bottom: 1rem; }
        .storefront-richtext-html li { margin-bottom: 0.25rem; line-height: 1.75; }
        .storefront-richtext-html li p { margin-bottom: 0; }
        .storefront-richtext-html a { color: #2563eb; text-decoration: underline; }
        .storefront-richtext-html a:hover { text-decoration: none; }
        .storefront-richtext-html code { background: #f3f4f6; padding: 0.1rem 0.3rem; border-radius: 0.2rem; font-size: 0.85em; font-family: monospace; }
        .storefront-richtext-html pre { background: #f3f4f6; padding: 1rem; border-radius: 0.375rem; margin: 1rem 0; overflow-x: auto; }
        .storefront-richtext-html pre code { background: none; padding: 0; font-size: 0.85em; }
        .storefront-richtext-html blockquote { border-left: 4px solid #d1d5db; padding-left: 1rem; font-style: italic; margin: 1rem 0; color: #6b7280; }
        .storefront-richtext-html table { min-width: 100%; border-collapse: collapse; margin: 1rem 0; }
        .storefront-richtext-html thead { background: #3B3634; color: white; }
        .storefront-richtext-html th { border: 1px solid #d1d5db; padding: 0.5rem 1rem; text-align: left; font-weight: 600; }
        .storefront-richtext-html td { border: 1px solid #d1d5db; padding: 0.5rem 1rem; }
      `}</style>
    </div>
  )
}
