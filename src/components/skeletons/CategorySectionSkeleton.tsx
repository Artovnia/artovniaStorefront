'use client';

export const CategorySectionSkeleton = () => {
  return (
    <section className="bg-primary py-8 w-full">
      <div className="mb-6">
        <div className="h-8 bg-gray-200 w-64 animate-pulse rounded"></div>
      </div>
      <div className="flex flex-row gap-4 overflow-x-hidden">
        {Array(5).fill(0).map((_, index) => (
          <div key={index} className="min-w-[180px] h-[120px] bg-gray-200 animate-pulse rounded shadow-sm flex items-center justify-center">
            <div className="h-6 bg-gray-300 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    </section>
  );
};
