import { cn } from '@/lib/utils';

export const FilterCheckboxOption = ({
  label,
  amount,
  checked = false,
  onCheck = () => null,
  disabled = false,
  value,
}: {
  label: string;
  amount?: number;
  checked?: boolean;
  onCheck?: (option: string) => void;
  disabled?: boolean;
  value?: string; // Optional value prop that defaults to label if not provided
}) => {
  // Handler that ensures consistent selection/deselection
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent any default behavior
    e.stopPropagation(); // Stop event from bubbling up
    
    if (!disabled) {
      // Pass the value (or fallback to label) to the parent component
      onCheck(value ?? label);
    }
  };
  
  return (
    <div 
      className={cn(
        'flex gap-4 items-center',
        !disabled && 'cursor-pointer'
      )}
      onClick={handleClick}
      role="button" // Add proper accessibility role
      tabIndex={disabled ? -1 : 0} // Make it focusable unless disabled
      aria-disabled={disabled}
      aria-checked={checked}
    >
      <span 
        className={cn(
          "checkbox-wrapper relative flex items-center justify-center", 
          checked && "!bg-action",
          disabled && "!bg-disabled !border-disabled !cursor-default"
        )}
      >
        {checked && !disabled && <span className="text-white text-sm absolute">✓</span>}
        <input
          type="checkbox"
          className={cn(
            "w-[20px] h-[20px] opacity-0 cursor-pointer",
            disabled && "cursor-default"
          )}
          checked={checked}
          readOnly
        />
      </span>
      <p
        className={cn(
          'label-md !font-normal',
          checked && '!font-semibold',
          disabled && 'text-disabled'
        )}
      >
        {label}{' '}
        {amount !== undefined && (
          <span className='label-sm !font-light'>
            ({amount})
          </span>
        )}
      </p>
    </div>
  );
};