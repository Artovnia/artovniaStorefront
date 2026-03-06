'use client';
import { cn } from '@/lib/utils';
import { Link } from '@/i18n/routing';
import { usePathname } from 'next/navigation';
import { ForwardIcon } from '@/icons';

interface BreadcrumbsProps {
  items: { label: string; path: string; isHome?: boolean }[];
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
        {items.map(({ path, label, isHome }, index) => {
          const isActive = pathname === path;
          return (
            <li
              key={path}
              className='inline-flex items-center shrink-0'
            >
              {index > 0 && <span className="text-[#3B3634]/60 ">/</span>}
              <Link
                href={path}
                className={cn(
                  'inline-flex items-center text-[#3B3634] hover:text-[#BFB7AD] font-instrument-sans text-lg transition-colors truncate max-w-[200px] sm:max-w-[300px] md:max-w-none',
                  index > 0 && 'ml-1',
                  isActive && 'text-[#BFB7AD] pointer-events-none'
                )}
                title={label}
              >
                {isHome ? (
                  <>
                    <svg
                      className='w-4 h-4 md:hidden'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth='1.8'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      aria-hidden='true'
                    >
                      <path d='M3 10.5 12 3l9 7.5' />
                      <path d='M5.5 9.5V21h13V9.5' />
                    </svg>
                    <span className='hidden md:inline'>{label}</span>
                    <span className='sr-only md:hidden'>{label}</span>
                  </>
                ) : (
                  label
                )}
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
