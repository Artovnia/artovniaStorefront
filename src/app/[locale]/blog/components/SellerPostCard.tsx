import Image from 'next/image'
import Link from 'next/link'
import { format } from 'date-fns'
import { urlFor } from '../lib/sanity'
import { SellerPost } from '../lib/data'

interface SellerPostCardProps {
  post: SellerPost
  featured?: boolean
}

export default function SellerPostCard({ post, featured = false }: SellerPostCardProps) {
  const mainImageUrl = post.mainImage 
    ? urlFor(post.mainImage).width(600).height(400).url()
    : '/images/placeholder.svg'

  return (
    <article className={`bg-primary rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 ${featured ? 'md:col-span-2' : ''}`}>
      <Link href={`/blog/${post.slug.current}`} className="block">
        <div className={`relative ${featured ? 'h-64' : 'h-48'}`}>
          <Image
            src={mainImageUrl}
            alt={post.mainImage?.alt || post.sellerName}
            fill
            className="object-cover"
            sizes={featured ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 100vw, 33vw"}
          />
          {post.featuredOnHomepage && (
            <div className="absolute top-4 left-4">
              <span className="bg-[#3B3634] text-white px-3 py-1 rounded-full text-sm font-medium font-instrument-sans">
                Projektant tygodnia
              </span>
            </div>
          )}
        </div>
      </Link>
      
      <div className="p-6">
        
        
        <Link href={`/blog/${post.slug.current}`} className="block group">
          <h3 className={`font-semibold text-[#3B3634] group-hover:text-[#3B3634] transition-colors duration-200 mb-2 font-instrument-serif ${featured ? 'text-2xl' : 'text-xl'}`}>
            {post.title}
          </h3>
        </Link>
        
        
        {post.shortDescription && (
          <p className="text-[#3B3634] mb-4 line-clamp-3 font-instrument-sans">
            {post.shortDescription}
          </p>
        )}
        
        <div className="flex items-center justify-between text-sm text-[#3B3634] font-instrument-sans">
          <Link 
            href={`/sellers/${post.sellerHandle}`}
            className="text-[#3B3634] hover:text-[#3B3634] font-medium"
          >
            Odwiedź sklep →
          </Link>
          <time dateTime={post.publishedAt}>
            {format(new Date(post.publishedAt), 'MMM dd, yyyy')}
          </time>
        </div>
        
        {post.linkedProducts && post.linkedProducts.length > 0 && (
          <div className="mt-4 pt-4 border-t border-[#F4F0EB]">
            <p className="text-xs text-[#3B3634] font-instrument-sans">
              {post.linkedProducts.length} {post.linkedProducts.length === 1 ? 'produkt' : 'produkty'} w artykule
            </p>
          </div>
        )}
      </div>
    </article>
  )
}
