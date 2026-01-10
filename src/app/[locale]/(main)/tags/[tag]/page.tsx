import { Metadata } from "next"
import { notFound } from "next/navigation"
import { listProductsByTag, getTagBySlug, getRelatedTags } from "@/lib/data/tags"
import { generateBreadcrumbJsonLd } from "@/lib/helpers/seo"
import { detectUserCountry } from "@/lib/helpers/country-detection"
import Link from "next/link"
import { Label } from "@/components/atoms"
import { TagProductListing } from "@/components/sections/TagProductListing/TagProductListing"

type Props = {
  params: Promise<{ tag: string; locale: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}


export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>
}): Promise<Metadata> {
  const { tag } = await params
  const tagValue = getTagBySlug(tag)

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://artovnia.com'

  return {
    title: `${tagValue} - Produkty z tagiem | Artovnia`,
    description: `Przeglądaj wszystkie produkty oznaczone tagiem "${tagValue}". Unikalne dzieła sztuki i rękodzieła od polskich artystów na Artovnia.`,
    keywords: [tagValue, 'sztuka', 'rękodzieło', 'marketplace', 'handmade'].join(', '),
    alternates: {
      canonical: `${baseUrl}/tags/${tag}`,
    },
    openGraph: {
      title: `${tagValue} - Produkty`,
      description: `Produkty oznaczone tagiem "${tagValue}"`,
      url: `${baseUrl}/tags/${tag}`,
      siteName: 'Artovnia',
      type: 'website',
      locale: 'pl_PL',
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export const revalidate = 1800 // Revalidate every 30 minutes (product listings should be relatively fresh)

export default async function TagPage({ params, searchParams }: Props) {
  const { tag, locale } = await params
  const urlParams = await searchParams
  const tagValue = getTagBySlug(tag)
  
  // Get page from search params
  const page = typeof urlParams.page === 'string' ? parseInt(urlParams.page) : 1
  const limit = 24
  const offset = (page - 1) * limit

  // Detect user's country for pricing context
  const countryCode = await detectUserCountry()

  // Fetch products with this tag (server-side for SEO)
  const { products, count } = await listProductsByTag(tagValue, {
    limit,
    offset,
    countryCode,
  })

  // If no products found, show 404
  if (count === 0) {
    return notFound()
  }

  // Fetch related tags
  const relatedTags = await getRelatedTags(tagValue, 8)

  const capitalizeFirst = (str: string) => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
};

  // Generate structured data for SEO
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { label: "Strona główna", path: "/" },
    { label: "Tagi", path: "/tags" },
    { label: tagValue, path: `/tags/${tag}` },
  ])

  return (
    <>
      {/* Structured Data (JSON-LD) for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <main className="min-h-screen bg-primary max-w-[1920px] mx-auto">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8 ">
          {/* Tag Header */}
          <div className="mb-8">
  <h1 className="flex items-center justify-center text-3xl md:text-4xl font-instrument-serif italic mb-2 first-letter:uppercase">
    {capitalizeFirst(tagValue)}
  </h1>
  <p className="flex items-center justify-center text-ui-fg-subtle font-instrument-sans">
    Znaleziono {count} {count === 1 ? 'produkt' : count < 5 ? 'produkty' : 'produktów'}
  </p>
</div>

          {/* Related Tags - SEO Internal Linking */}
          {relatedTags.length > 0 && (
            <div className="mb-8 pb-6 border-b border-ui-border-base max-w-[1450px] mx-auto">
              <p className="text-sm text-ui-fg-subtle mb-3 font-instrument-sans">
                Powiązane tagi:
              </p>
              <div className="flex gap-2 flex-wrap">
                {relatedTags.map((relatedTag) => (
                  <Link
                    key={relatedTag.slug}
                    href={`/tags/${relatedTag.slug}`}
                    className="hover:opacity-80 transition-opacity"
                  >
                    <Label>
                      {relatedTag.value} ({relatedTag.count})
                    </Label>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Product Listing with Pagination */}
          <TagProductListing
            initialProducts={products}
            initialCount={count}
            initialPage={page}
            limit={limit}
            tagValue={tagValue}
          />

          {/* Back to all tags link - SEO */}
          <div className="mt-12 text-center">
            <Link
              href="/tags"
              className="text-sm text-ui-fg-subtle hover:text-ui-fg-base underline font-instrument-sans"
            >
              ← Przeglądaj wszystkie tagi
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}
