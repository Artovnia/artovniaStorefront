import { cn } from '@/lib/utils';

interface ChipProps {
  value?: React.ReactNode | string;
  selected?: boolean;
  disabled?: boolean;
  color?: boolean;
  onSelect?: () => void;
  className?: string;
}

export function Chip({
  value,
  selected,
  disabled,
  color,
  onSelect,
  className,
}: ChipProps) {
  const baseClasses = 'chip-wrapper';
  const selectedClasses = selected ? 'border-primary' : '';
  const hoverClasses =
    !disabled && !selected ? 'hover:bg-gray-200' : '';
  const disabledClasses = disabled
    ? 'bg-component border-disabled/50 hover:bg-component cursor-not-allowed text-disabled'
    : 'cursor-pointer';
  const colorClasses = color
    ? 'w-[40px] h-[40px] border'
    : '';

  return (
    <div
      data-disabled={disabled}
      className={cn(
        baseClasses,
        colorClasses,
        selectedClasses,
        hoverClasses,
        disabledClasses,
        className
      )}
      onClick={!disabled ? onSelect : undefined}
      onKeyDown={!disabled ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect?.()
        }
      } : undefined}
      role='option'
      aria-selected={selected}
      aria-disabled={disabled}
      aria-label={typeof value === 'string' ? value : undefined}
      tabIndex={disabled ? -1 : 0}
    >
      {color ? (
        <span
          className={cn(
            'w-[32px] h-[32px] bg-action absolute top-[3px] left-[3px]  z-10',
            disabled && 'bg-disabled'
          )}
          style={{
            backgroundColor: (value || '').toString(),
          }}
        />
      ) : (
        value
      )}
    </div>
  );
}
