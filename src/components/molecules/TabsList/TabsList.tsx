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
    const tabValue = link.endsWith('/reviews') ? 'recenzje' : 'produkty';
    
    const params = new URLSearchParams(searchParams.toString());
    if (tabValue === 'produkty') {
      params.delete('tab');
    } else {
      params.set('tab', tabValue);
    }
    
    const basePath = link.replace('/reviews', '');
    const newUrl = params.toString() ? `${basePath}?${params.toString()}` : basePath;
    
    router.push(newUrl, { scroll: false });
  };
  
  return (
    <div className="relative w-full border-b border-[#3b3634]/80">
      <div className="flex">
        {list.map(({ label, link }) => {
          const isActive = activeTab.trim() === label.toLowerCase().trim();
          
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
                  relative block px-8 py-2
                  text-xs tracking-[0.25em] uppercase font-light
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