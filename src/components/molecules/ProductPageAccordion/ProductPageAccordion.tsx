'use client';
import { PlusIcon } from '@/icons';
import { cn } from '@/lib/utils';
import { useEffect, useRef, useState } from 'react';

export const ProductPageAccordion = ({
  children,
  heading,
  defaultOpen = false,
}: {
  children: React.ReactNode;
  heading: string;
  defaultOpen?: boolean;
}) => {
  const [open, setOpen] = useState(defaultOpen);
  const [contentHeight, setContentHeight] = useState(
    defaultOpen ? '100%' : 0
  );

  const accordionRef = useRef(null);

  useEffect(() => {
    if (accordionRef.current && open) {
      setContentHeight(
        accordionRef.current['scrollHeight'] || 0
      );
    }
  }, [open, children]);

  const openHandler = () => {
    setOpen(!open);
  };
  
  return (
    <div className="border-t border-[#3B3634]/10">
      <div
        onClick={openHandler}
        className="flex justify-between items-center cursor-pointer xl:px-4 py-4 
                   hover:bg-[#3B3634]/5 transition-all duration-200
                   active:scale-[0.99]"
      >
        <h4 className="text-2xl font-instrument-serif text-[#3B3634] tracking-tight">
          {heading}
        </h4>
        <div className="relative w-6 h-6 flex items-center justify-center">
          <PlusIcon
            size={24}
            className={cn(
              'transition-all duration-300 text-[#3B3634]',
              open && 'rotate-45'
            )}
          />
        </div>
      </div>
      <div
        ref={accordionRef}
        className={cn(
          'transition-all duration-300 overflow-hidden xl:px-4'
        )}
        style={{ maxHeight: open ? 'none' : 0 }}
      >
        <div 
          className={cn(
            "pb-6 text-[#3B3634] leading-relaxed transition-all duration-300",
            open ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
};
