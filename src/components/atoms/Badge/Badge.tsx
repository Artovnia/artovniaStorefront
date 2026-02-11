import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  className?: string;
}

export function Badge({ children, className, ...rest }: BadgeProps) {
  return (
    <span
      className={cn(
        'absolute top-0 right-0 translate-x-1/2 -translate-y-1/2',
        'inline-flex items-center justify-center',
        'min-w-4 min-h-4 px-2 py-1',
        'label-sm leading-none',
        'text-action-on-primary bg-action rounded-xs',
        className
      )}
      {...rest}
    >
      {children}
    </span>
  );
}