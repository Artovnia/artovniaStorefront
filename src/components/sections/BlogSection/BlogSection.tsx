import { BlogCarousel } from '@/components/organisms/BlogCarousel';
import { BlogCard } from '@/components/organisms/BlogCard/BlogCard';
import { getLatestBlogPosts } from '@/app/[locale]/(main)/blog/lib/data';
import Link from 'next/link';
import { unstable_cache } from 'next/cache';

export async function BlogSection() {
  // ✅ Use Next.js server-side cache to prevent skeleton loading on navigation
  const getCachedBlogPosts = unstable_cache(
    async () => {
      return await getLatestBlogPosts();
    },
    ['homepage-blog-latest'], // Cache key
    {
      revalidate: 60, // 1 minute - reduced to match blog listing page cache
      tags: ['homepage-blog', 'blog']
    }
  )
  
  const blogPosts = await getCachedBlogPosts();

  if (!blogPosts || blogPosts.length === 0) {
    return null;
  }

  return (
    <section className='bg-white w-full py-2 md:py-8 overflow-hidden' aria-labelledby='blog-section-heading'>
      <div className='flex items-center justify-between mb-6 md:mb-12 px-4 sm:px-6 lg:px-8'>
        <h2 id='blog-section-heading' className='heading-lg text-black font-instrument-serif italic'>
          Bądź na czasie
        </h2>
        <Link 
          href='/blog'
          className='group relative text-[#3B3634] font-instrument-sans font-medium px-4 py-2  overflow-hidden transition-all duration-300 hover:text-white'
          aria-label='Zobacz wszystkie wpisy na blogu'
        >
          <span className='absolute inset-0 bg-[#3B3634] transform translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300 ease-out'></span>
          <span className='relative flex items-center gap-2'>
            Zobacz wszystkie
            <span className='inline-block transition-transform duration-300 group-hover:translate-x-1'>
              →
            </span>
          </span>
        </Link>
      </div>
      
      {/* Mobile: Carousel */}
      <div className='lg:hidden '>
        <BlogCarousel posts={blogPosts} />
      </div>
      
      {/* Desktop: Grid */}
      <div className='hidden lg:grid lg:grid-cols-3 gap-8 px-4 sm:px-6 lg:px-8'>
        {blogPosts.map((post, index) => (
          <BlogCard
            key={post._id}
            index={index}
            post={post}
          />
        ))}
      </div>
    </section>
  );
}