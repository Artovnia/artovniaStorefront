import { BlogCarousel } from '@/components/organisms/BlogCarousel';
import { BlogCard } from '@/components/organisms/BlogCard/BlogCard';
import { getLatestBlogPosts } from '@/app/[locale]/blog/lib/data';
import Link from 'next/link';

export async function BlogSection() {
  const blogPosts = await getLatestBlogPosts();

  if (!blogPosts || blogPosts.length === 0) {
    return null;
  }

  return (
    <section className='bg-white w-full py-8'>
      <div className='flex items-center justify-between mb-12 px-4'>
        <h2 className='heading-lg text-black font-instrument-serif italic'>
          Bądź na czasie
        </h2>
        <Link 
          href='/blog'
          className='text-black hover:text-gray-700 transition-colors duration-200 font-instrument-sans font-medium'
        >
          Zobacz wszystkie →
        </Link>
      </div>
      
      {/* Mobile: Carousel */}
      <div className='lg:hidden'>
        <BlogCarousel posts={blogPosts} />
      </div>
      
      {/* Desktop: Grid */}
      <div className='hidden lg:grid lg:grid-cols-3 gap-8 px-4'>
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
