import { cn } from "@/lib/utils"
import { Link } from "../Link"

interface NavigationItemProps extends React.ComponentPropsWithoutRef<"a"> {
  active?: boolean
  hasNotification?: boolean
}

export const NavigationItem: React.FC<NavigationItemProps> = ({
  children,
  href = "/",
  className,
  active,
  hasNotification,
  ...props
}) => (
  <Link
    href={href}
    className={cn(
      "label-md uppercase px-4 py-3 my-3 md:my-0 flex items-center justify-between",
      active && "underline  underline-offset-8",
      className
    )}
    {...props}
  >
    <div className="flex items-center">
      {children}
      {hasNotification && (
        <span className="ml-2 w-2 h-2 rounded-full bg-primary" title="New messages" />
      )}
    </div>
  </Link>
)
