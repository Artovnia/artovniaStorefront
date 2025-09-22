import { UserPageLayout } from "@/components/molecules"
import { retrieveCustomer } from "@/lib/data/customer"
import { redirect } from "next/navigation"
import { Addresses } from "@/components/organisms"
import { listRegions } from "@/lib/data/regions"

// Disable caching for this page to ensure fresh address data
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function Page() {
  const user = await retrieveCustomer(false) // Disable caching for addresses page
  const regions = await listRegions()

  if (!user) {
    redirect("/user")
  }

  return (
    <UserPageLayout title="Adresy">
      <Addresses {...{ user, regions }} />
    </UserPageLayout>
  )
}
