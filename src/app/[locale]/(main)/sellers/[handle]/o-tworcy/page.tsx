import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getSellerByHandle } from "@/lib/data/seller"
import { getSellerReviews } from "@/lib/data/reviews"
import { getSellerPage } from "@/lib/data/vendor-page"
import { retrieveCustomer } from "@/lib/data/customer"
import {
  generateSellerJsonLd,
  generateBreadcrumbJsonLd,
  getBaseUrl,
  getSiteName,
  ensureValidImageUrl,
  generateDescription,
} from "@/lib/helpers/seo"
import {
  extractVendorPageSeoSummary,
  mergeSellerDescription,
} from "@/lib/helpers/seller-seo"
import { Breadcrumbs } from "@/components/atoms/Breadcrumbs/Breadcrumbs"
import { SellerSidebar } from "@/components/organisms"
import { VendorPageRenderer } from "@/components/organisms/VendorPageBlocks"
import { JsonLd } from "@/components/JsonLd"
import { SellerProps } from "@/types/seller"
import { Link } from "@/i18n/routing"

export const revalidate = 300

type SellerStoryPageProps = {
  params: Promise<{ handle: string; locale: string }>
}

export async function generateMetadata({
  params,
}: SellerStoryPageProps): Promise<Metadata> {
  const { handle, locale } = await params

  try {
    const [sellerResult, vendorPageResult] = await Promise.allSettled([
      getSellerByHandle(handle),
      getSellerPage(handle),
    ])

    const seller = sellerResult.status === "fulfilled" ? sellerResult.value : null
    const vendorPage =
      vendorPageResult.status === "fulfilled" ? vendorPageResult.value?.page : null

    if (!seller || !vendorPage) {
      return {
        title: "Historia twórcy niedostępna",
        description: "Nie znaleziono strony twórcy.",
        robots: { index: false, follow: false },
      }
    }

    const baseUrl = getBaseUrl()
    const siteName = getSiteName()
    const storyUrl = `${baseUrl}/sellers/${seller.handle}/o-tworcy`
    const sellerImage = ensureValidImageUrl(
      seller.photo || seller.logo_url,
      `${baseUrl}/ArtovniaOgImage.png`
    )

    const vendorStorySummary = extractVendorPageSeoSummary(vendorPage)
    const description = generateDescription(
      mergeSellerDescription(seller.description, vendorStorySummary),
      `Poznaj historię twórcy ${seller.name}, jego proces twórczy i materiały wykorzystywane do tworzenia unikalnego rękodzieła.`,
      160
    )

    return {
      title: `Poznaj twórcę ${seller.name} | ${siteName}`,
      description,
      robots: { index: true, follow: true },
      alternates: {
        canonical: storyUrl,
      },
      openGraph: {
        title: `Poznaj twórcę ${seller.name}`,
        description,
        url: storyUrl,
        type: "profile",
        siteName,
        locale: locale === "pl" ? "pl_PL" : "en_US",
        images: [{ url: sellerImage, alt: `${seller.name} - historia twórcy` }],
      },
      twitter: {
        card: "summary_large_image",
        title: `Poznaj twórcę ${seller.name}`,
        description,
        images: [sellerImage],
      },
    }
  } catch {
    return {
      title: "Poznaj twórcę",
      description: "Historia twórcy na Artovnia.",
    }
  }
}

export default async function SellerStoryPage({ params }: SellerStoryPageProps) {
  const { handle } = await params

  const [sellerResult, reviewsResult, vendorPageResult, userResult] =
    await Promise.allSettled([
      getSellerByHandle(handle),
      getSellerReviews(handle).catch(() => ({ reviews: [] })),
      getSellerPage(handle),
      retrieveCustomer().catch(() => null),
    ])

  const seller = sellerResult.status === "fulfilled" ? sellerResult.value : null
  const reviews =
    reviewsResult.status === "fulfilled" ? reviewsResult.value?.reviews || [] : []
  const vendorPage =
    vendorPageResult.status === "fulfilled" ? vendorPageResult.value?.page : null
  const user = userResult.status === "fulfilled" ? userResult.value : null

  if (!seller || !vendorPage || !vendorPage.settings?.show_story_tab) {
    notFound()
  }

  const sellerWithReviews = {
    ...seller,
    reviews,
  }

  const sellerJsonLd = generateSellerJsonLd(
    {
      id: seller.id,
      name: seller.name,
      handle: seller.handle,
      description: mergeSellerDescription(
        seller.description,
        extractVendorPageSeoSummary(vendorPage)
      ),
      photo: seller.photo,
      logo_url: seller.logo_url,
      created_at: seller.created_at,
    },
    reviews
  )

  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { label: "Strona główna", path: "/" },
    { label: "Sprzedawcy", path: "/sellers" },
    { label: seller.name, path: `/sellers/${seller.handle}` },
    { label: "Poznaj twórcę", path: `/sellers/${seller.handle}/o-tworcy` },
  ])

  const breadcrumbItems = [
    { label: "Strona główna", path: "/" },
    { label: "Sprzedawcy", path: "/sellers" },
    { label: seller.name, path: `/sellers/${seller.handle}` },
    { label: "Poznaj twórcę", path: `/sellers/${seller.handle}/o-tworcy` },
  ]

  return (
    <>
      <JsonLd data={sellerJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />

      <main className="container">
        <div className="mt-6 mb-4">
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[30%_70%] gap-6 mt-0 md:mt-8">
          <aside className="lg:sticky lg:top-40 lg:self-start">
            <SellerSidebar seller={sellerWithReviews as SellerProps} user={user} />
          </aside>

          <section>
            <nav className="relative w-full border-b border-[#3b3634]/80 mb-8">
              <div className="flex">
                <Link
                  href={`/sellers/${seller.handle}/o-tworcy`}
                  className="relative block px-2 md:px-4 py-2 text-xs uppercase font-light text-white bg-[#3b3634]"
                >
                  poznaj twórcę
                </Link>
                <Link
                  href={`/sellers/${seller.handle}?tab=produkty`}
                  className="relative block px-2 md:px-4 py-2 text-xs uppercase font-light text-gray-600 hover:text-gray-900"
                >
                  produkty
                </Link>
                <Link
                  href={`/sellers/${seller.handle}?tab=recenzje`}
                  className="relative block px-2 md:px-4 py-2 text-xs uppercase font-light text-gray-600 hover:text-gray-900"
                >
                  recenzje
                </Link>
              </div>
            </nav>

            <h1 className="heading-lg mb-6">Poznaj twórcę: {seller.name}</h1>
            <VendorPageRenderer
              page={vendorPage}
              sellerId={seller.id}
              sellerHandle={seller.handle}
            />
          </section>
        </div>
      </main>
    </>
  )
}
