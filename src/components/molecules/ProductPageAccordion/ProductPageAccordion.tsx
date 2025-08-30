'use client';
import { MinusThinIcon } from '@/icons';
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
    <div className='border-t border-gray-200'>
      <div
        onClick={openHandler}
        className='flex justify-between items-center cursor-pointer px-4 py-8 hover:bg-gray-50 transition-colors duration-200'       
      >
        <h4 className='text-2xl font-instrument-serif text-gray-900'>{heading}</h4>
        <div className='relative'>
          <MinusThinIcon
            className={cn(
              'absolute top-0 left-0 transition-all duration-300 text-gray-600',
              !open && 'rotate-90'
            )}
          />
          <MinusThinIcon className='text-gray-600' />
        </div>
      </div>
      <div
        ref={accordionRef}
        className={cn(
          'transition-all duration-300 h-full overflow-hidden px-4'
        )}
        style={{ maxHeight: open ? 'none' : 0 }}
      >
        <div className='pb-4'>{children}</div>
      </div>
    </div>
  );
};
