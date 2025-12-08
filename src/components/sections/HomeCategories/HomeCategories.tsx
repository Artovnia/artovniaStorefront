import { CategoryCard } from "@/components/organisms"

export const categories: { id: number; name: string; handle: string; featured?: boolean }[] = [
  {
    id: 1,
    name: "Zwierzęta",
    handle: "Zwierzeta",
    featured: true, // Large featured category
  },
  {
    id: 2,
    name: "Torebki i plecaki",
    handle: "Torebki-i-plecaki",
  },
  {
    id: 3,
    name: "Figury i rzeźby",
    handle: "Figury-i-rzezby",
  },
  {
    id: 4,
    name: "Obrazy",
    handle: "Obrazy",
  },
  {
    id: 5,
    name: "Prezent dla niego",
    handle: "Prezent-dla-niego",
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
    <section className="mx-auto max-w-[1920px] w-full px-4 lg:px-8 py-2 md:py-8 font-instrument-sans">
      {/* Heading */}
      <div className="mb-6 lg:mb-12">
        <h2 className="text-2xl lg:text-3xl xl:text-4xl font-instrument-serif font-normal tracking-tight normal-case text-[#3B3634]">
          {heading}{headingItalic && <> <span className="italic">{headingItalic}</span></>}
        </h2>
      </div>

      {/* Grid Layout: 1 Large + 4 Small */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 xl:gap-8">
        {/* Large Featured Category - Left Side */}
        <div className="w-full">
          <CategoryCard 
            category={featuredCategory} 
            size="large"
          />
        </div>

        {/* 4 Smaller Categories - Right Side (2x2 Grid) */}
        <div className="grid grid-cols-2 gap-4 lg:gap-6 xl:gap-8">
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