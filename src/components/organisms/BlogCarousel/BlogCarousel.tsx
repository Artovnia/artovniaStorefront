'use client';

import { Carousel } from "@/components/cells"
import { BlogCard } from "../BlogCard/BlogCard"
import { BlogPost } from "@/app/[locale]/blog/lib/data"

interface BlogCarouselProps {
  posts: BlogPost[]
}

export function BlogCarousel({ posts }: BlogCarouselProps) {
  if (!posts || posts.length === 0) {
    return (
      <div className="flex justify-center w-full py-8">
        <p className="text-gray-500">No blog posts available</p>
      </div>
    );
  }

  const blogCards = posts.map((post, index) => (
    <BlogCard
      key={post._id}
      post={post}
      index={index}
    />
  ));

  return (
    <div className="w-full max-w-full">
      <Carousel
        align="start"
        items={blogCards}
        theme="default"
      />
    </div>
  );
}
