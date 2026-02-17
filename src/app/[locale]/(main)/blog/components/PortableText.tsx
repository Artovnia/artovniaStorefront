import { PortableText as BasePortableText } from '@portabletext/react'
import Image from 'next/image'
import { urlFor } from '../lib/sanity'
import BlogProductCarouselWrapper from './BlogProductCarouselWrapper'

const components = {
  types: {
    image: ({ value }: any) => {
      if (!value?.asset?._ref) {
        return null
      }
      
      return (
        <div className="my-8">
          <Image
            src={urlFor(value).width(800).height(600).url()}
            alt={value.alt || 'Blog image'}
            width={800}
            height={600}
            className=" w-full h-auto"
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
          />
          {value.caption && (
            <p className="text-sm text-gray-600 mt-2 text-center italic font-instrument-sans">
              {value.caption}
            </p>
          )}
        </div>
      )
    },
    codeBlock: ({ value }: any) => (
      <div className="my-6">
        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
          <code className={`language-${value.language || 'text'}`}>
            {value.code}
          </code>
        </pre>
      </div>
    ),
    productCarousel: ({ value }: any) => {
      if (!value?.products || value.products.length === 0) {
        return null
      }

      return (
        <BlogProductCarouselWrapper
          title={value.title}
          productItems={value.products}
          showPrices={value.showPrices !== false}
          showSellerName={value.showSellerName !== false}
        />
      )
    },
  },
  block: {
    h1: ({ children }: any) => (
      <h1 className="text-4xl  mt-8 mb-4 text-[#3B3634] font-instrument-serif">{children}</h1>
    ),
    h2: ({ children }: any) => (
      <h2 className="text-3xl  mt-6 mb-3 text-[#3B3634] font-instrument-serif">{children}</h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="text-2xl  mt-6 mb-3 text-[#3B3634] font-instrument-serif">{children}</h3>
    ),
    h4: ({ children }: any) => (
      <h4 className="text-xl mt-4 mb-2 text-[#3B3634] font-instrument-serif">{children}</h4>
    ),
    blockquote: ({ children }: any) => (
      <blockquote className="p-6 md:p-8 bg-[#F4F0EB] rounded-lg text-center my-8">
        {/* Quote icon - smaller than QuoteBlock */}
        <svg className="w-6 h-6 md:w-8 md:h-8 mx-auto text-[#3B3634]/40 mb-3" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
        </svg>
        <div className="text-lg md:text-xl italic text-[#3B3634] font-instrument-serif">
          {children}
        </div>
      </blockquote>
    ),
    normal: ({ children }: any) => (
      <p className="mb-4 text-[#3B3634] leading-relaxed font-instrument-sans">{children}</p>
    ),
  },
  list: {
    bullet: ({ children }: any) => (
      <ul className="list-disc list-inside mb-4 space-y-2 text-[#3B3634] font-instrument-sans">
        {children}
      </ul>
    ),
    number: ({ children }: any) => (
      <ol className="list-decimal list-inside mb-4 space-y-2 text-[#3B3634] font-instrument-sans">
        {children}
      </ol>
    ),
  },
  listItem: {
    bullet: ({ children }: any) => <li className="ml-4 font-instrument-sans">{children}</li>,
    number: ({ children }: any) => <li className="ml-4 font-instrument-sans">{children}</li>,
  },
  marks: {
    strong: ({ children }: any) => (
      <strong className="font-bold font-instrument-sans">{children}</strong>
    ),
    em: ({ children }: any) => <em className="italic font-instrument-sans">{children}</em>,
    code: ({ children }: any) => (
      <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono text-red-600">
        {children}
      </code>
    ),
    link: ({ children, value }: any) => (
      <a
        href={value.href}
        target={value.blank ? '_blank' : '_self'}
        rel={value.blank ? 'noopener noreferrer' : undefined}
        className="text-[#BFB7AD] hover:text-[#3B3634] underline font-instrument-sans"
      >
        {children}
      </a>
    ),
  },
}

interface PortableTextProps {
  content: any
  className?: string
}

export default function PortableText({ content, className = '' }: PortableTextProps) {
  if (!content) return null

  return (
    <div className={`prose prose-lg max-w-none ${className}`}>
      <BasePortableText value={content} components={components} />
    </div>
  )
}
