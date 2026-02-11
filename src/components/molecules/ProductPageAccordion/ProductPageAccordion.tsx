'use client';
import { PlusIcon } from '@/icons';
import { cn } from '@/lib/utils';
import { useEffect, useId, useRef, useState } from 'react';

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
  const uniqueId = useId();
  const headingId = `accordion-heading-${uniqueId}`;
  const panelId = `accordion-panel-${uniqueId}`;

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
      <button
        type="button"
        onClick={openHandler}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openHandler();
          }
        }}
        aria-expanded={open}
        aria-controls={panelId}
        id={headingId}
        className="flex justify-between items-center cursor-pointer xl:px-4 py-4 w-full text-left
                   hover:bg-[#3B3634]/5 transition-all duration-200
                   active:scale-[0.99]"
      >
        <span className="text-2xl font-instrument-serif text-[#3B3634] tracking-tight">
          {heading}
        </span>
        <div className="relative w-6 h-6 flex items-center justify-center" aria-hidden="true">
          <PlusIcon
            size={24}
            className={cn(
              'transition-all duration-300 text-[#3B3634]',
              open && 'rotate-45'
            )}
          />
        </div>
      </button>
      <div
        ref={accordionRef}
        id={panelId}
        role="region"
        aria-labelledby={headingId}
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
