export const Dropdown = ({
  children,
  show,
}: {
  children: React.ReactNode;
  show: boolean;
}) => {
  if (!show) return null;

  return (
    <div
      className="
        fixed left-3 right-3 top-16 z-50
        rounded-sm border border-primary bg-primary text-primary
        lg:absolute lg:left-auto lg:-right-2 lg:top-auto lg:z-20
        lg:w-max
      "
    >
      {children}
    </div>
  );
};