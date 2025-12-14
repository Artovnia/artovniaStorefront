import { Metadata } from "next"
import { getPopularTags } from "@/lib/data/tags"
import Link from "next/link"
import { Label } from "@/components/atoms"

export const metadata: Metadata = {
  title: "Przeglądaj według tagów | Artovnia",
  description: "Odkryj produkty według tagów - handmade, ceramika, minimalistyczny i więcej. Przeglądaj unikalne dzieła sztuki i rękodzieła.",
  robots: {
    index: true,
    follow: true,
  },
}

export default async function TagsIndexPage() {
  const popularTags = await getPopularTags(50)

  return (
    <main className="container py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="flex items-center justify-center text-4xl font-instrument-serif italic mb-4">
          Przeglądaj według tagów
        </h1>
        <p className="flex items-center justify-center text-ui-fg-subtle font-instrument-sans mb-12">
          Znajdź produkty według popularnych tagów
        </p>

        {/* Tag Cloud - sized by popularity */}
        <div className="flex flex-wrap gap-3 font-instrument-sans">
          {popularTags.map((tag, index) => {
            // Calculate font size based on popularity (top tags are bigger)
            const sizeClass = index < 5 
              ? 'text-xl' 
              : index < 15 
              ? 'text-lg' 
              : 'text-base'
            
            return (
              <Link
                key={tag.slug}
                href={`/tags/${tag.slug}`}
                className={`hover:opacity-80 transition-opacity ${sizeClass}`}
              >
                <Label>
                  {tag.value} ({tag.count})
                </Label>
              </Link>
            )
          })}
        </div>
      </div>
    </main>
  )
}
