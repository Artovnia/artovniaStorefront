'use client'

import Image from 'next/image'
import { useMemo } from 'react'

interface ImageTextBlockData {
  image_id?: string
  image_url?: string
  image_position: 'left' | 'right'
  title?: string
  title_alignment?: 'left' | 'center' | 'right'
  title_italic?: boolean
  content: string
  image_ratio: '1:1' | '4:3' | '16:9'
  rounded_edges?: boolean
  focal_point?: { x: number; y: number }
}

interface ImageTextBlockProps {
  data: ImageTextBlockData
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
  html = html.replace(/^#### (.+)$/gm, '<h4>$1</h4>')
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>')
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>')
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>')
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')
  html = html.replace(/_(.+?)_/g, '<em>$1</em>')
  html = html.replace(/~~(.+?)~~/g, '<del>$1</del>')
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>')
  html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
  html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
  html = html.replace(/^[-*+] (.+)$/gm, '<li>$1</li>')
  html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
  html = html.replace(/(<li>.+<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`)
  
  const paragraphs = html.split('\n\n')
  html = paragraphs.map(para => {
    if (para.match(/^<(h[1-4]|ul|ol|blockquote)/)) return para
    return `<p>${para.replace(/\n/g, '<br>')}</p>`
  }).join('\n')
  
  return html
}

export const ImageTextBlock = ({ data }: ImageTextBlockProps) => {
  const {
    image_url,
    image_position = 'left',
    title,
    title_alignment = 'left',
    title_italic = false,
    content,
    image_ratio = '16:9',
    rounded_edges = true,
    focal_point
  } = data

  // Helper to get focal point style
  const getFocalPointStyle = () => {
    if (!focal_point) return {}
    return { objectPosition: `${focal_point.x}% ${focal_point.y}%` }
  }

  const titleAlignmentClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  }

  const titleClasses = `text-2xl md:text-3xl font-instrument-serif mb-4 ${titleAlignmentClasses[title_alignment]} ${title_italic ? 'italic' : ''}`

  const isHtml = useMemo(() => content ? isHtmlContent(content) : false, [content])

  const renderedHtml = useMemo(() => {
    if (!content) return ''
    return isHtml ? content : parseMarkdown(content)
  }, [content, isHtml])

  // Don't render empty image-text blocks
  const hasContent = image_url || title || (content && content.trim() !== '')
  if (!hasContent) {
    return null
  }

  const ratioClasses = {
    '1:1': 'aspect-square',
    '4:3': 'aspect-[4/3]',
    '16:9': 'aspect-video'
  }

  const imageElement = (
    <div className={`relative ${ratioClasses[image_ratio]} overflow-hidden ${rounded_edges ? 'rounded-lg' : ''}`}>
      {image_url && (
        <Image
          src={image_url}
          alt={title || 'Section image'}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          style={getFocalPointStyle()}
        />
      )}
    </div>
  )

  const textElement = (
    <div className="flex flex-col justify-center">
      {title && (
        <h2 className={titleClasses}>
          {title}
        </h2>
      )}
      {renderedHtml && (
        <div
          className="storefront-imagetext-html prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: renderedHtml }}
        />
      )}
      <style>{`
        .storefront-imagetext-html p { margin-bottom: 1rem; line-height: 1.75; }
        .storefront-imagetext-html strong { font-weight: 700; }
        .storefront-imagetext-html em { font-style: italic; }
        .storefront-imagetext-html u { text-decoration: underline; }
        .storefront-imagetext-html s,
        .storefront-imagetext-html del { text-decoration: line-through; color: #6b7280; }
        .storefront-imagetext-html h1 { font-size: 1.875rem; font-weight: 700; margin: 1.5rem 0 0.75rem; }
        .storefront-imagetext-html h2 { font-size: 1.5rem; font-weight: 700; margin: 1.25rem 0 0.5rem; }
        .storefront-imagetext-html h3 { font-size: 1.25rem; font-weight: 600; margin: 1rem 0 0.5rem; }
        .storefront-imagetext-html h4 { font-size: 1.125rem; font-weight: 600; margin: 0.75rem 0 0.5rem; }
        .storefront-imagetext-html ul { list-style-type: disc; margin-left: 1.5rem; margin-bottom: 1rem; }
        .storefront-imagetext-html ol { list-style-type: decimal; margin-left: 1.5rem; margin-bottom: 1rem; }
        .storefront-imagetext-html li { margin-bottom: 0.25rem; line-height: 1.75; }
        .storefront-imagetext-html li p { margin-bottom: 0; }
        .storefront-imagetext-html a { color: #2563eb; text-decoration: underline; }
        .storefront-imagetext-html a:hover { text-decoration: none; }
        .storefront-imagetext-html code { background: #f3f4f6; padding: 0.1rem 0.3rem; border-radius: 0.2rem; font-size: 0.85em; font-family: monospace; }
        .storefront-imagetext-html pre { background: #f3f4f6; padding: 1rem; border-radius: 0.375rem; margin: 1rem 0; overflow-x: auto; }
        .storefront-imagetext-html pre code { background: none; padding: 0; font-size: 0.85em; }
        .storefront-imagetext-html blockquote { border-left: 4px solid #d1d5db; padding-left: 1rem; font-style: italic; margin: 1rem 0; color: #6b7280; }
        .storefront-imagetext-html table { min-width: 100%; border-collapse: collapse; margin: 1rem 0; }
        .storefront-imagetext-html thead { background: #3B3634; color: white; }
        .storefront-imagetext-html th { border: 1px solid #d1d5db; padding: 0.5rem 1rem; text-align: left; font-weight: 600; }
        .storefront-imagetext-html td { border: 1px solid #d1d5db; padding: 0.5rem 1rem; }
      `}</style>
    </div>
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
      {image_position === 'left' ? (
        <>
          {imageElement}
          {textElement}
        </>
      ) : (
        <>
          {textElement}
          {imageElement}
        </>
      )}
    </div>
  )
}
