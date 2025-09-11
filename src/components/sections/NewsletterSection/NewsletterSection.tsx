import NewsletterSubscription from '@/components/cells/NewsletterSubscription/NewsletterSubscription'

interface NewsletterSectionProps {
  className?: string
}

export default function NewsletterSection({ className = '' }: NewsletterSectionProps) {
  return (
    <section className={`w-full bg-primary py-16 md:py-20 lg:py-24 ${className}`}>
      <div className="mx-auto max-w-[1920px] px-4 md:px-6 lg:px-8">
        <NewsletterSubscription />
      </div>
    </section>
  )
}
