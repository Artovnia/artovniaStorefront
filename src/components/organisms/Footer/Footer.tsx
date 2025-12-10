import { Link } from "@/i18n/routing"
import { footerLinks } from "@/data/footerLinks"
import { FacebookIcon, InstagramIcon, LinkedInIcon, YouTubeIcon } from "@/icons/social"
import { HttpTypes } from "@medusajs/types"

interface FooterProps {
  categories?: HttpTypes.StoreProductCategory[]
}

/**
 * Footer Component
 * 
 * ✅ OPTIMIZED: Accepts categories as props to avoid duplicate API calls
 * Categories are fetched once in layout and passed to both Header and Footer
 * 
 * @param categories - Product categories to display in footer navigation
 */
export async function Footer({ categories = [] }: FooterProps) {
  // Categories now passed as props - no need to fetch here
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
    <footer 
      className="bg-tertiary text-white font-instrument-sans" 
      role="contentinfo"
      aria-label="Stopka strony"
    >
      {/* Main Footer Content - 4 Columns */}
      <div className="max-w-[1920px] mx-auto px-6 py-12" id="footer-content">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Column 1: Sklep (Categories) */}
          <div>
            <h2 className="text-white font-instrument-sans font-normal text-lg mb-6 uppercase" id="footer-shop">
              Sklep
            </h2>
            <nav className="space-y-3 font-instrument-sans uppercase" aria-labelledby="footer-shop">
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
            <h2 className="text-white font-instrument-sans font-normal text-lg mb-6 uppercase" id="footer-about">
              O nas
            </h2>
            <nav className="space-y-3 font-instrument-sans uppercase" aria-labelledby="footer-about">
              {footerLinks.about.map(({ name, href }) => (
                <Link 
                  key={name} 
                  href={href} 
                  className="block text-white hover:text-primary transition-colors duration-200 text-sm"
                >
                  {name}
                </Link>
              ))}
              <Link 
                href="/support" 
                className="block text-white hover:text-primary transition-colors duration-200 text-sm"
              >
                Kontakt
              </Link>
            </nav>
          </div>

          {/* Column 3: Dla kupujących */}
          <div>
            <h2 className="text-white font-instrument-sans font-normal text-lg mb-6 uppercase" id="footer-buyers">
              Dla kupujących
            </h2>
            <nav className="space-y-3 font-instrument-sans uppercase" aria-labelledby="footer-buyers">
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
            <h2 className="text-white font-instrument-sans font-normal text-lg mb-6 uppercase" id="footer-sellers">
              Dla sprzedających
            </h2>
            <nav className="space-y-3 font-instrument-sans uppercase" aria-labelledby="footer-sellers">
              <Link href="/przewodnik-sprzedawcy" className="block text-white hover:text-primary transition-colors duration-200 text-sm">
                Zacznij z nami sprzedawać
              </Link>
             
              <Link 
                href="https://annawawrzyniak.my.canva.site/przewodnik-artovnia" 
                className="block text-white hover:text-primary transition-colors duration-200 text-sm"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Poradnik (otwiera się w nowej karcie)"
              >
                Poradnik
                <span className="sr-only"> (otwiera się w nowej karcie)</span>
              </Link>
              <Link href="/faq-sprzedawcy" className="block text-white hover:text-primary transition-colors duration-200 text-sm">
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
            <p className="text-2xl font-instrument-serif font-normal tracking-wider mb-6" aria-hidden="true">
              ARTOVNIA
            </p>
          </div>
          <nav className="flex justify-center space-x-6" aria-label="Media społecznościowe">
            {/* Social media icons - hardcoded for now */}

          {/*  <Link
              href="https://facebook.com"
              className="text-white hover:text-primary transition-all duration-200 p-2 rounded-full hover:bg-white/10"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook - Media społecznościowe"
            > 
              {getIcon('Facebook')}
            </Link> */}
            <Link
              href="https://www.instagram.com/artovnia__com/?igsh=N3hlN2g4aXdjMWs4#"
              className="text-white hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-tertiary transition-all duration-200 p-2 rounded-full hover:bg-white/10"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Odwiedź nasz profil na Instagram (otwiera się w nowej karcie)"
            >
              {getIcon('Instagram')}
              <span className="sr-only">Instagram</span>
            </Link>
            {/*  <Link
              href="https://linkedin.com"
              className="text-white hover:text-primary transition-all duration-200 p-2 rounded-full hover:bg-white/10"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn - Media społecznościowe"
            >
              {getIcon('LinkedIn')}
            </Link> */}

            {/* <Link
              href="https://youtube.com"
              className="text-white hover:text-primary transition-all duration-200 p-2 rounded-full hover:bg-white/10"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube - Media społecznościowe"
            >
              {getIcon('YouTube')}
            </Link> */}
          </nav>
        </div>
      </div>

      {/* Trademark/Copyright Section */}
      <div className="bg-primary" style={{ backgroundColor: '#F4F0EB' }} role="contentinfo" aria-label="Informacje o prawach autorskich">
        <div className="max-w-[1920px] mx-auto px-6 py-2 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="font-instrument-sans text-black text-sm">
            <span aria-label="Copyright">&copy;</span> ARTOVNIA <time dateTime="2025">2025</time>
          </p>
          <p className="font-instrument-sans text-black text-xs">
            Korzystanie z serwisu oznacza akceptację <Link href="/regulamin" className="text-black hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 transition-colors underline">Regulaminu</Link>.
          </p>
        </div>
      </div>
    </footer>
  )
}
