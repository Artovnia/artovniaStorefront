import { LoginForm, ProfileDetails, UserPageLayout } from "@/components/molecules"
import { ProfilePassword } from "@/components/molecules/ProfileDetails/ProfilePassword"
import { retrieveCustomer } from "@/lib/data/customer"
import { Suspense } from "react"

// 🔒 REQUIRED: User pages require authentication check (cookies) and LoginForm uses useSearchParams
export const dynamic = 'force-dynamic'

export default async function ReviewsPage() {
  const user = await retrieveCustomer()

  if (!user) return (
    <Suspense fallback={<div className="container py-8">Ładowanie...</div>}>
      <LoginForm />
    </Suspense>
  )

  return (
    <UserPageLayout title="Ustawienia">
      <ProfileDetails user={user} />
      <ProfilePassword user={user} />
    </UserPageLayout>
  )
}
