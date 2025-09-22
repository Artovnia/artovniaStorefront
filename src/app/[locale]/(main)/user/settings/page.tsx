import { LoginForm, ProfileDetails, UserPageLayout } from "@/components/molecules"
import { ProfilePassword } from "@/components/molecules/ProfileDetails/ProfilePassword"
import { retrieveCustomer } from "@/lib/data/customer"

export default async function ReviewsPage() {
  const user = await retrieveCustomer()

  if (!user) return <LoginForm />

  return (
    <UserPageLayout title="Ustawienia">
      <ProfileDetails user={user} />
      <ProfilePassword user={user} />
    </UserPageLayout>
  )
}
