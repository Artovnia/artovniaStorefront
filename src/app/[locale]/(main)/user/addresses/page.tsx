import { UserNavigation } from "@/components/molecules"
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
    <main className="container">
      <div className="grid grid-cols-1 md:grid-cols-4 mt-6 gap-5 md:gap-8">
        <UserNavigation />
        <Addresses {...{ user, regions }} />
      </div>
    </main>
  )
}
