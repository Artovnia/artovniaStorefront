import Image from 'next/image'
import Link from 'next/link'
import { format } from 'date-fns'
import { urlFor } from '../lib/sanity'
import { BlogPost } from '../lib/data'

interface BlogPostCardProps {
  post: BlogPost
  featured?: boolean
}

export default function BlogPostCard({ post, featured = false }: BlogPostCardProps) {
  const imageUrl = post.mainImage 
    ? urlFor(post.mainImage).width(600).height(400).url()
    : '/images/placeholder.svg'

  return (
    <article className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 ${featured ? 'md:col-span-2' : ''}`}>
      <Link href={`/blog/${post.slug.current}`} className="block">
        <div className={`relative ${featured ? 'h-64' : 'h-48'}`}>
          <Image
            src={imageUrl}
            alt={post.mainImage?.alt || post.title}
            fill
            className="object-cover"
            sizes={featured ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 100vw, 33vw"}
          />
          {post.featured && (
            <div className="absolute top-4 left-4">
              <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                Featured
              </span>
            </div>
          )}
        </div>
      </Link>
      
      <div className="p-6">
        {post.categories && post.categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {post.categories.map((category) => (
              <Link
                key={category.slug.current}
                href={`/blog/category/${category.slug.current}`}
                className="text-xs font-medium text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded"
              >
                {category.title}
              </Link>
            ))}
          </div>
        )}
        
        <Link href={`/blog/${post.slug.current}`} className="block group">
          <h3 className={`font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-200 mb-2 ${featured ? 'text-2xl' : 'text-xl'}`}>
            {post.title}
          </h3>
        </Link>
        
        {post.excerpt && (
          <p className="text-gray-600 mb-4 line-clamp-3">
            {post.excerpt}
          </p>
        )}
        
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            {post.author?.image && (
              <div className="relative w-8 h-8">
                <Image
                  src={urlFor(post.author.image).width(32).height(32).url()}
                  alt={post.author.name}
                  fill
                  className="rounded-full object-cover"
                />
              </div>
            )}
            <span>{post.author?.name}</span>
          </div>
          <time dateTime={post.publishedAt}>
            {format(new Date(post.publishedAt), 'MMM dd, yyyy')}
          </time>
        </div>
        
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-4">
            {post.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded"
              >
                #{tag}
              </span>
            ))}
            {post.tags.length > 3 && (
              <span className="text-xs text-gray-500">
                +{post.tags.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>
    </article>
  )
}
