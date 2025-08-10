export default function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Changed h-full to w-full and removed any height constraint to work with parent flex-grow
  return <div className="-mt-6 font-instrument-sans text-xl w-full">{children}</div>
}
