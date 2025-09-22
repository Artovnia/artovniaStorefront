import { LoginForm, UserPageLayout } from "@/components/molecules"
import { retrieveCustomer } from "@/lib/data/customer"

export default async function UserPage() {
  const user = await retrieveCustomer()

  if (!user) return <LoginForm />

  return (
    <UserPageLayout className="h-full max-w-[1920px] mx-auto py-12">
      <h1 className="heading-xl uppercase">Witaj {user.first_name}</h1>
      <p className="label-md">Twoje konto jest gotowe</p>
    </UserPageLayout>
  )
}