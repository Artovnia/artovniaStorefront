import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Konserwacja | Artovnia',
  description: 'Strona jest obecnie w trakcie konserwacji. Wrócimy wkrótce.',
  robots: 'noindex, nofollow',
}

export default function MaintenanceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
