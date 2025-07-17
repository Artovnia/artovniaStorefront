import { LoginForm } from "@/components/molecules"
import { UserNavigation } from "@/components/molecules"
import { retrieveCustomer } from "@/lib/data/customer"
import Link from "next/link"
import { NewMessageForm } from "./new-message-form"

export default async function NewMessagePage() {
  const user = await retrieveCustomer()

  if (!user) return <LoginForm />

  return (
    <main className="container">
      <div className="grid grid-cols-1 md:grid-cols-4 mt-6 gap-5 md:gap-8">
        <UserNavigation />
        <div className="md:col-span-3 space-y-8">
          <div>
            <Link href="/user/messages" className="text-sm text-primary hover:underline mb-2 inline-block">
              ← Wróć do wiadomości
            </Link>
            <h1 className="heading-md uppercase">Nowa wiadomość</h1>
          </div>
          
          <NewMessageForm />
        </div>
      </div>
    </main>
  )
}