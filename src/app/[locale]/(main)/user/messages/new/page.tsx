import { LoginForm } from "@/components/molecules"
import { UserNavigation } from "@/components/molecules"
import { retrieveCustomer } from "@/lib/data/customer"
import Link from "next/link"
import { NewMessageForm } from "./new-message-form"
import { Suspense } from "react"

// 🔒 REQUIRED: User pages require authentication check (cookies) and LoginForm uses useSearchParams
export const dynamic = 'force-dynamic'

export default async function NewMessagePage() {
  const user = await retrieveCustomer()

  if (!user) return (
    <Suspense fallback={<div className="container py-8">Ładowanie...</div>}>
      <LoginForm />
    </Suspense>
  )

  return (
    <main className="container">
      <div className="grid grid-cols-1 md:grid-cols-4 mt-6 gap-5 md:gap-8">
        <UserNavigation />
        <div className="md:col-span-3 space-y-8">
          <div>
            <Link href="/user/messages" className="text-lg hover:underline mb-2 inline-block font-instrument-sans">
              ← Wróć do wiadomości
            </Link>
            <h1 className="heading-md uppercase font-instrument-sans">Nowa wiadomość</h1>
          </div>
          
          <NewMessageForm />
        </div>
      </div>
    </main>
  )
}