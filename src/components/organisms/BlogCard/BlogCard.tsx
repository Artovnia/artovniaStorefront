import Image from "next/image"
import Link from "next/link"
import { BlogPost } from "@/app/[locale]/blog/lib/data"
import { urlFor } from "@/app/[locale]/blog/lib/sanity"
import { ArrowRightIcon } from "@/icons"
import tailwindConfig from "../../../../tailwind.config"
import { format } from "date-fns"

interface BlogCardProps {
  post: BlogPost
  index: number
}

export function BlogCard({ post, index }: BlogCardProps) {
  const imageUrl = post.mainImage 
    ? urlFor(post.mainImage).width(467).height(472).url()
    : '/images/placeholder.svg'

  const categoryName = post.categories && post.categories.length > 0 
    ? post.categories[0].title.toUpperCase() 
    : 'BLOG'

  return (
    <Link
      href={`/blog/${post.slug.current}`}
      className="group block border border-secondary p-1 rounded-sm relative"
    >
      <div className="relative overflow-hidden rounded-xs h-full">
        <Image
          src={imageUrl}
          alt={post.mainImage?.alt || post.title}
          width={467}
          height={472}
          className="object-cover max-h-[472px] h-full w-full"
          priority={index === 0}
        />
        {/* Category badge */}
        <div className="absolute top-4 left-4">
          <span className="bg-black text-white px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide">
            {categoryName}
          </span>
        </div>
        {/* Date badge */}
        <div className="absolute top-4 right-4">
          <span className="bg-white/90 text-black px-3 py-1 rounded-full text-xs font-medium">
            {format(new Date(post.publishedAt), 'MMM dd')}
          </span>
        </div>
      </div>
      <div className="p-4 bg-tertiary text-tertiary absolute bottom-0 left-1 lg:opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-b-xs w-[calc(100%-8px)]">
        <h3 className="heading-sm font-instrument-serif">{post.title}</h3>
        {post.excerpt && (
          <p className="text-md line-clamp-2 font-instrument-sans mt-2">{post.excerpt}</p>
        )}
        <div className="flex items-center gap-4 uppercase label-md mt-[26px] font-instrument-sans">
          Czytaj więcej{" "}
          <ArrowRightIcon
            size={20}
            color={tailwindConfig.theme.extend.colors.tertiary}
          />
        </div>
      </div>
    </Link>
  )
}
