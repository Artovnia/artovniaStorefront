import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

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
  if (color) {
    return (
      <div
        data-disabled={disabled}
        className={cn(
          "relative flex h-6 w-6 shrink-0 items-center justify-center",
          "rounded-full border-2 transition-all duration-200",
          selected
            ? "border-primary"
            : "border-transparent",
          disabled
            ? "cursor-not-allowed opacity-40 ring-1 ring-black/10"
            : "cursor-pointer  hover:shadow-sm",
          className,
        )}
        onClick={!disabled ? onSelect : undefined}
        onKeyDown={
          !disabled
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect?.();
                }
              }
            : undefined
        }
        role="option"
        aria-selected={selected}
        aria-disabled={disabled}
        aria-label={typeof value === "string" ? value : undefined}
        tabIndex={disabled ? -1 : 0}
      >
        <span
          className="h-4 w-4 rounded-full  ring-1 ring-black/10"
          style={{ backgroundColor: (value || "").toString() }}
        />
        {selected && (
          <span className="absolute inset-0 flex items-center justify-center">
            <Check
              className="h-4 w-4 "
              style={{
                color: isLightColor((value || "").toString())
                  ? "#000"
                  : "#fff",
              }}
              strokeWidth={3}
            />
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      data-disabled={disabled}
      className={cn(
        "relative inline-flex items-center justify-center",
        "rounded-lg border px-2 py-1 text-sm font-medium bg-white mx-0.5",
        "transition-all duration-200 select-none",
        selected
          ? "border-primary bg-white text-primary ring-1 ring-primary/20"
          : "border-border bg-white text-foreground",
        disabled
          ? "cursor-not-allowed border-muted bg-muted/50 text-muted-foreground opacity-60"
          : "cursor-pointer",
        !disabled &&
          !selected &&
          "hover:border-primary/40 hover:bg-muted/50 ",
        className,
      )}
      onClick={!disabled ? onSelect : undefined}
      onKeyDown={
        !disabled
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect?.();
              }
            }
          : undefined
      }
      role="option"
      aria-selected={selected}
      aria-disabled={disabled}
      aria-label={typeof value === "string" ? value : undefined}
      tabIndex={disabled ? -1 : 0}
    >
      {selected && (
        <Check className="mr-1.5 h-3.5 w-3.5 shrink-0 text-primary" />
      )}
      <span className="truncate">{value}</span>
    </div>
  );
}

/** Rough heuristic to determine if a hex color is light */
function isLightColor(hex: string): boolean {
  const clean = hex.replace("#", "");
  if (clean.length < 6) return true;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6;
}