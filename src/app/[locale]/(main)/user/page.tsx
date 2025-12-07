import { LoginForm, UserPageLayout } from "@/components/molecules"
import { retrieveCustomer } from "@/lib/data/customer"
import { redirect } from "next/navigation"

// 🔒 CRITICAL: Disable caching for user-specific data
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function UserPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>
}) {
  const user = await retrieveCustomer()
  const params = await searchParams
  const redirectUrl = params.redirect

  // If user is already logged in and there's a redirect URL, redirect them
  if (user && redirectUrl) {
    redirect(redirectUrl)
  }

  // If not logged in, show login form with redirect parameter
  if (!user) return <LoginForm redirectUrl={redirectUrl} />

  return (
    <UserPageLayout className="h-full max-w-[1920px] mx-auto py-12">
      <h1 className="heading-xl uppercase">Witaj {user.first_name}</h1>
      <p className="label-md">Twoje konto jest gotowe</p>
    </UserPageLayout>
  )
}