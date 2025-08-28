import { Link } from "@/i18n/routing"
import { footerLinks } from "@/data/footerLinks"
import { FacebookIcon, InstagramIcon, LinkedInIcon, YouTubeIcon } from "@/icons/social"
import { HttpTypes } from "@medusajs/types"
import { listCategories } from "@/lib/data/categories"

export async function Footer() {
  // Fetch categories directly in Footer component
  let categories: HttpTypes.StoreProductCategory[] = []
  try {
    const categoriesData = await listCategories()
    if (categoriesData && categoriesData.parentCategories) {
      categories = categoriesData.parentCategories
    }
  } catch (error) {
    console.error("Footer: Error retrieving categories:", error)
  }
  const getIcon = (label: string) => {
    switch(label) {
      case 'Facebook':
        return <FacebookIcon size={32} className="hover:scale-110 transition-transform duration-200" />
      case 'Instagram':
        return <InstagramIcon size={32} className="hover:scale-110 transition-transform duration-200" />
      case 'LinkedIn':
        return <LinkedInIcon size={32} className="hover:scale-110 transition-transform duration-200" />
      case 'YouTube':
        return <YouTubeIcon size={32} className="hover:scale-110 transition-transform duration-200" />
      default:
        return null
    }
  }

  return (
    <footer className="bg-tertiary text-white font-instrument-sans">
      {/* Main Footer Content - 4 Columns */}
      <div className="max-w-[1920px] mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Column 1: Sklep (Categories) */}
          <div>
            <h2 className="text-white font-instrument-sans font-bold text-lg mb-6 uppercase">
              Sklep
            </h2>
            <nav className="space-y-3 font-instrument-sans uppercase" aria-label="Kategorie produktów">
              <Link href="/categories" className="block text-white hover:text-primary transition-colors duration-200 text-sm">
                Wszystkie produkty
              </Link>
              {categories.slice(0, 6).map((category) => (
                <Link 
                  key={category.id} 
                  href={`/categories/${category.handle}`} 
                  className="block text-white hover:text-primary transition-colors duration-200 text-sm"
                >
                  {category.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Column 2: O nas */}
          <div>
            <h2 className="text-white font-instrument-sans font-bold text-lg mb-6 uppercase">
              O nas
            </h2>
            <nav className="space-y-3 font-instrument-sans uppercase" aria-label="O nas">
              {footerLinks.about.map(({ name, href }) => (
                <Link 
                  key={name} 
                  href={href} 
                  className="block text-white hover:text-primary transition-colors duration-200 text-sm"
                >
                  {name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Column 3: Dla kupujących */}
          <div>
            <h2 className="text-white font-instrument-sans font-bold text-lg mb-6 uppercase">
              Dla kupujących
            </h2>
            <nav className="space-y-3 font-instrument-sans uppercase" aria-label="Dla kupujących">
              {footerLinks.customerServices.map(({ name, href }) => (
                <Link 
                  key={name} 
                  href={href} 
                  className="block text-white hover:text-primary transition-colors duration-200 text-sm"
                >
                  {name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Column 4: Dla sprzedających */}
          <div>
            <h2 className="text-white font-instrument-sans font-bold text-lg mb-6 uppercase">
              Dla sprzedających
            </h2>
            <nav className="space-y-3 font-instrument-sans uppercase" aria-label="Dla sprzedających">
              <Link href="/poradnik-sprzedawcy" className="block text-white hover:text-primary transition-colors duration-200 text-sm">
                Zacznij z nami sprzedawać
              </Link>
              <Link href="#" className="block text-white hover:text-primary transition-colors duration-200 text-sm">
                Regulamin dla sprzedawców
              </Link>
              <Link href="#" className="block text-white hover:text-primary transition-colors duration-200 text-sm">
                Poradnik
              </Link>
              <Link href="/sellers-faq" className="block text-white hover:text-primary transition-colors duration-200 text-sm">
                FAQ
              </Link>
            </nav>
          </div>

        </div>
      </div>

      {/* Social Media Icons - Centered below columns */}
      <div className="w-full border-t border-white/20">
        <div className="max-w-[1920px] mx-auto px-6 py-8">
          <div className="flex justify-center items-center">
            <h2 className="text-2xl font-instrument-serif font-medium tracking-wider mb-6">
              ARTOVNIA
            </h2>
          </div>
          <div className="flex justify-center space-x-6" aria-label="Media społecznościowe">
            {/* Social media icons - hardcoded for now */}
            <Link
              href="https://facebook.com"
              className="text-white hover:text-primary transition-all duration-200 p-2 rounded-full hover:bg-white/10"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook - Media społecznościowe"
            >
              {getIcon('Facebook')}
            </Link>
            <Link
              href="https://instagram.com"
              className="text-white hover:text-primary transition-all duration-200 p-2 rounded-full hover:bg-white/10"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram - Media społecznościowe"
            >
              {getIcon('Instagram')}
            </Link>
            <Link
              href="https://linkedin.com"
              className="text-white hover:text-primary transition-all duration-200 p-2 rounded-full hover:bg-white/10"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn - Media społecznościowe"
            >
              {getIcon('LinkedIn')}
            </Link>
            <Link
              href="https://youtube.com"
              className="text-white hover:text-primary transition-all duration-200 p-2 rounded-full hover:bg-white/10"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube - Media społecznościowe"
            >
              {getIcon('YouTube')}
            </Link>
          </div>
        </div>
      </div>

      {/* Trademark/Copyright Section */}
      <div className="bg-primary" style={{ backgroundColor: '#F4F0EB' }}>
        <div className="max-w-[1920px] mx-auto px-6 py-2 flex justify-between items-center">
          <p className="font-instrument-sans text-black text-sm">
            © ARTOVNIA 2025
          </p>
          <p className="font-instrument-sans text-black text-xs">
            Korzystanie z serwisu oznacza akceptację Regulaminu.
          </p>
        </div>
      </div>
    </footer>
  )
}
