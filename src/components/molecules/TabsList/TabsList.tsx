'use client';
import { useRouter, useSearchParams } from 'next/navigation';

export const TabsList = ({
  list,
  activeTab,
}: {
  list: { label: string; link: string }[];
  activeTab: string;
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const handleTabClick = (label: string, link: string) => {
    router.push(link, { scroll: false });
  };
  
  // Extract tab value from link for comparison
  const getTabValueFromLink = (link: string): string => {
    const url = new URL(link, 'http://dummy.com');
    const tabParam = url.searchParams.get('tab');
    // If no tab param, it's the default 'produkty' tab
    return tabParam || 'produkty';
  };
  
  return (
    <div className="relative w-full border-b border-[#3b3634]/80">
      <div className="flex">
        {list.map(({ label, link }) => {
          const tabValue = getTabValueFromLink(link);
          const isActive = activeTab === tabValue;
          
          return (
            <button
              key={label}
              onClick={() => handleTabClick(label, link)}
              className="group relative focus:outline-none"
            >
              {/* Background shape */}
              <span 
                className={`
                  absolute inset-x-2  bottom-0 -z-10
                   transition-all duration-300 ease-out
                  ${isActive 
                    ? 'bg-[#3b3634]' 
                    : 'bg-transparent group-hover:bg-stone-50/60'
                  }
                `}
              />
              
              {/* Tab content */}
              <span 
                className={`
                  relative block px-2 lg:tracking-[0.25em] md:px-4 py-2
                  text-xs  uppercase font-light
                  transition-all duration-300 ease-out
                  ${isActive 
                    ? 'text-white bg-[#3b3634]' 
                    : 'text-gray-600 group-hover:text-gray-900'
                  }
                `}
              >
                {label}
              </span>
              

            </button>
          );
        })}
      </div>
    </div>
  );
};