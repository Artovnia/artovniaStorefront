import { Link } from "@/i18n/routing"
import footerLinks from "@/data/footerLinks"
import { FacebookIcon, InstagramIcon, LinkedInIcon } from "@/icons/social"

export function Footer() {
  return (
    <footer className="bg-tertiary text-white font-instrument-sans justify-between">
      <div className="grid grid-cols-1 lg:grid-cols-3 max-w-[1920px] mx-auto ">
        {/* Customer Services Column */}
        <div className="p-6 ">
          <h2 className="heading-sm text-primary mb-12  text-white  font-bold">
            Usługi klienta
          </h2>
          <nav className="space-y-3 font-instrument-sans uppercase" aria-label="Customer services navigation">
            {footerLinks.customerServices.map(({ label, path }) => (
              <Link key={label} href={path} className="block label-md">
                {label}
              </Link>
            ))}
          </nav>
        </div>

        {/* About Column */}
        <div className="p-6 ">
          <h2 className="heading-sm text-primary mb-12  text-white font-instrument-sans font-bold">
            O nas
          </h2>
          <nav className="space-y-3 font-instrument-sans uppercase" aria-label="About navigation">
            {footerLinks.about.map(({ label, path }) => (
              <Link key={label} href={path} className="block label-md">
                {label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Connect Column */}
        <div className="p-6 ">
          <h2 className="heading-sm text-primary mb-12  text-white font-instrument-sans font-bold">
            Social media
          </h2>
          <div className="flex space-x-5 mt-4" aria-label="Social media navigation">
            {footerLinks.connect.map(({ label, path }) => {
              const getIcon = () => {
                switch(label) {
                  case 'Facebook':
                    return <FacebookIcon size={28} />
                  case 'Instagram':
                    return <InstagramIcon size={28} />
                  case 'LinkedIn':
                    return <LinkedInIcon size={28} />
                  default:
                    return null
                }
              }

              return (
                <Link
                  key={label}
                  href={path}
                  className="hover:opacity-80 transition-opacity"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                >
                  {getIcon()}
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      <div className="py-6 ">
        <p className="text-md text-secondary text-center font-instrument-sans text-white ">© 2025 Artovnia</p>
      </div>
    </footer>
  )
}
