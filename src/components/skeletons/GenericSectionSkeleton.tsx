'use client';

export const GenericSectionSkeleton = () => {
  return (
    <section className="container py-8 w-full">
      <div className="h-8 bg-gray-200 w-64 animate-pulse rounded mb-6"></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="h-[300px] bg-gray-100 animate-pulse rounded"></div>
        <div className="h-[300px] bg-gray-200 animate-pulse rounded flex flex-col justify-between p-6">
          <div>
            <div className="h-6 bg-gray-300 w-1/4 rounded mb-4"></div>
            <div className="h-10 bg-gray-300 w-3/4 rounded mb-2"></div>
            <div className="h-4 bg-gray-300 w-1/2 rounded"></div>
          </div>
          <div className="h-10 bg-gray-300 w-1/4 rounded"></div>
        </div>
      </div>
    </section>
  );
};
