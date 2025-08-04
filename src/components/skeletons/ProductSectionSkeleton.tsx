'use client';

export const ProductSectionSkeleton = () => {
  return (
    <section className="py-8 w-full">
      <div className="mb-6 h-8 bg-gray-200 w-64 animate-pulse rounded"></div>
      <div className="flex flex-row gap-4 overflow-x-hidden w-full">
        {Array(4).fill(0).map((_, index) => (
          <div key={index} className="min-w-[280px] h-[400px] bg-gray-100 animate-pulse rounded shadow-sm">
            <div className="h-[65%] bg-gray-200 rounded-t"></div>
            <div className="p-4">
              <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded mb-4 w-1/2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
