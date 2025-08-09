'use client';

import { Indicator } from '@/components/atoms';
import { ArrowLeftIcon, ArrowRightIcon } from '@/icons';
import { useRef, useState, useEffect } from 'react';
import tailwindConfig from '../../../../tailwind.config';

export const CustomCarousel = ({
  variant = 'light',
  items,
  align = 'start', // Not used anymore but kept for backwards compatibility
}: {
  variant?: 'light' | 'dark';
  items: React.ReactNode[];
  align?: 'center' | 'start' | 'end';
}) => {
  // Use refs for direct DOM manipulation instead of carousel library
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [maxScroll, setMaxScroll] = useState(1); // Initialize to non-zero to enable right arrow
  
  // Responsive scroll amount for each button click (in pixels)
  const scrollAmount = 350; // Approximately one product card width
  
  // Initialize scroll state on component mount
  useEffect(() => {
    if (scrollContainerRef.current) {
      const { scrollWidth, clientWidth } = scrollContainerRef.current;
      setMaxScroll(Math.max(0, scrollWidth - clientWidth));
    }
  }, [items]);
  
  const scrollNext = () => {
    if (!scrollContainerRef.current) return;
    
    const newPosition = Math.min(
      scrollPosition + scrollAmount, 
      scrollContainerRef.current.scrollWidth - scrollContainerRef.current.clientWidth
    );
    
    scrollContainerRef.current.scrollTo({
      left: newPosition,
      behavior: 'smooth'
    });
    
    setScrollPosition(newPosition);
  };
  
  const scrollPrev = () => {
    if (!scrollContainerRef.current) return;
    
    const newPosition = Math.max(scrollPosition - scrollAmount, 0);
    
    scrollContainerRef.current.scrollTo({
      left: newPosition,
      behavior: 'smooth'
    });
    
    setScrollPosition(newPosition);
  };
  
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setScrollPosition(scrollLeft);
      setMaxScroll(Math.max(0, scrollWidth - clientWidth));
    }
  };
  
  const arrowColor = {
    light: tailwindConfig.theme.extend.colors.primary,
    dark: tailwindConfig.theme.extend.colors.tertiary,
  };

  return (
    <div className='relative w-full max-w-full'>
      {/* Desktop Navigation Arrows */}
      <div className='hidden md:block'>
        <button
          className='absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-all duration-200'
          onClick={scrollPrev}
        >
          <ArrowLeftIcon color={arrowColor[variant]} size={20} />
        </button>
        <button
          className='absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-all duration-200'
          onClick={scrollNext}
        >
          <ArrowRightIcon color={arrowColor[variant]} size={20} />
        </button>
      </div>

      {/* Responsive scrollable container */}
      <div 
        className='w-full overflow-x-auto scrollbar-hide'
        ref={scrollContainerRef}
        onScroll={handleScroll}
        style={{
          scrollbarWidth: 'none', /* Firefox */
          msOverflowStyle: 'none', /* IE/Edge */
        }}
      >
        {/* Adjust space between cards */}
        <div className='flex gap-8 pb-4'>
          {items.map((slide, index) => (
            <div 
              key={index} 
              className='flex-none w-[280px]'
            >
              {slide}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className='flex justify-between items-center mt-4 md:hidden'>
        <div className='flex-1'>
          <Indicator
            variant={variant}
            maxStep={items.length}
            step={Math.ceil(scrollPosition / scrollAmount) + 1}
          />
        </div>
        <div className='flex gap-2'>
          <button
            className='p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
            onClick={scrollPrev}
            disabled={scrollPosition <= 0}
          >
            <ArrowLeftIcon color={arrowColor[variant]} size={16} />
          </button>
          <button
            className='p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
            onClick={scrollNext}
            disabled={scrollPosition >= maxScroll}
          >
            <ArrowRightIcon color={arrowColor[variant]} size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
