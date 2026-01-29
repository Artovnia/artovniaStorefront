'use client';
import { cn } from '@/lib/utils';
import { Link } from '@/i18n/routing';

import { ForwardIcon } from '@/icons';
import { usePathname } from 'next/navigation';

interface BreadcrumbsProps {
  items: { label: string; path: string }[];
  className?: string;
}

export function Breadcrumbs({
  items,
  className,
}: BreadcrumbsProps) {
  const pathname = usePathname();

  return (
    <nav
      className={cn('flex', className)}
      aria-label='Breadcrumb'
    >
      <ol className='flex flex-wrap items-center gap-2 gap-y-1'>
        {items.map(({ path, label }, index) => {
          const isActive = pathname === path;
          return (
            <li
              key={path}
              className='inline-flex items-center shrink-0'
            >
              {index > 0 && <ForwardIcon size={16} className="shrink-0" />}
              <Link
                href={path}
                className={cn(
                  'inline-flex items-center text-[#3B3634] hover:text-[#BFB7AD] font-instrument-sans text-lg transition-colors truncate max-w-[200px] sm:max-w-[300px] md:max-w-none',
                  index > 0 && 'ml-2',
                  isActive && 'text-[#BFB7AD] pointer-events-none'
                )}
                title={label}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
