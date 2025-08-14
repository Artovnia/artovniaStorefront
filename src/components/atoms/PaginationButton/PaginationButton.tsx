import { cn } from '@/lib/utils';

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  isActive?: boolean;
  disabled?: boolean;
  isNavArrow?: boolean;
}

export const PaginationButton = ({
  children,
  className = '',
  isActive = false,
  disabled = false,
  isNavArrow = false,
  ...props
}: ButtonProps) => {
  return (
    <button
      className={cn(
        'w-10 h-10 flex items-center justify-center rounded-full text-sm font-normal cursor-pointer',
        isNavArrow ? 'border-[#3B3634] hover:bg-[#BFB7AD]' : 'border-none',
        isActive && !disabled && 'ring-1 ring-[#3B3634] text-[#3B3634] border-none',
        !isActive && !disabled && !isNavArrow && 'hover:bg-[#BFB7AD]',
        disabled && 'text-gray-300 cursor-default hover:bg-transparent',
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
