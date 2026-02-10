/**
 * Categories layout — persists across /categories and /categories/[category] navigations.
 * Provides a stable structural shell so the page doesn't go blank when switching categories.
 * The actual sidebar + product grid are rendered by the page components inside {children}.
 */
export default function CategoriesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-[60vh]">
      {children}
    </div>
  )
}
