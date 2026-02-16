import { CategoryCard } from "@/components/organisms"

// Hardcoded featured categories for homepage
// These handles should match production database categories
export const categories: { 
  id: string; 
  name: string; 
  handle: string; 
  image: string;
  imagePosition?: string;
  featured?: boolean 
}[] = [
  {
    id: "1",
    name: "Biżuteria",
    handle: "bizuteria",
    image: "/images/categories/Bizuteria.webp",
    imagePosition: "center 50%",
    featured: true, // Large featured category
  },
  {
    id: "2",
    name: "Torebki i plecaki",
    handle: "torebki-i-plecaki",
    image: "/images/categories/Torebki-i-plecaki.webp",
    imagePosition: "center 90%",
  },
  {
    id: "3",
    name: "Dziecko",
    handle: "dziecko",
    image: "/images/categories/Dziecko.webp",
    imagePosition: "center 50%",
  },
  {
    id: "4",
    name: "Dekoracje",
    handle: "dekoracje",
    image: "/images/categories/Dekoracje.webp",
    imagePosition: "center 50%",
  },
  {
    id: "5",
    name: "Kuchnia i jadalnia",
    handle: "kuchnia-i-jadalnia",
    image: "/images/categories/Kubki.webp",
    imagePosition: "center 60%", // Shows more of the bottom of this image
  },
]

export const HomeCategories = async ({ 
  heading, 
  headingItalic 
}: { 
  heading: string;
  headingItalic?: string;
}) => {
  const featuredCategory = categories.find(cat => cat.featured) || categories[0]
  const otherCategories = categories.filter(cat => !cat.featured).slice(0, 4)

  return (
    <section className="mx-auto max-w-[1920px] w-full px-4 lg:px-8 py-2 md:py-8 font-instrument-sans" aria-labelledby="home-categories-heading">
      {/* Heading */}
      <div className="mb-6 lg:mb-12">
        <h2 id="home-categories-heading" className="text-2xl lg:text-3xl xl:text-4xl font-instrument-serif font-normal tracking-tight normal-case text-[#3B3634]">
          {heading}{headingItalic && <> <span className="italic">{headingItalic}</span></>}
        </h2>
      </div>

      {/* Grid Layout: 1 Large + 4 Small */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 xl:gap-8 items-start">
        {/* Large Featured Category - Left Side */}
        <div className="w-full h-full">
          <CategoryCard 
            category={featuredCategory} 
            size="large"
          />
        </div>

        {/* 4 Smaller Categories - Right Side (2x2 Grid) */}
        <div className="grid grid-cols-2 gap-4 lg:gap-6 xl:gap-8 h-full content-start">
          {otherCategories.map((category) => (
            <CategoryCard 
              key={category.id} 
              category={category}
              size="small"
            />
          ))}
        </div>
      </div>
    </section>
  )
}