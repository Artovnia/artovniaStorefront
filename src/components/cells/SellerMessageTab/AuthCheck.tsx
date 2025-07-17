"use client"

import { Button } from "@/components/atoms"
import Link from "next/link"

type AuthCheckProps = {
  children: React.ReactNode
  isAuthenticated: boolean
}

export function AuthCheck({ children, isAuthenticated }: AuthCheckProps) {
  // If the user is authenticated, render the children
  if (isAuthenticated) {
    return <>{children}</>
  }

  // If the user is not authenticated, show a message and login button
  return (
    <div className="border rounded-sm p-6 text-center space-y-4">
      <h3 className="heading-sm uppercase">Zaloguj się, aby wysłać wiadomość</h3>
      <p className="text-secondary">
        Aby wysłać wiadomość do sprzedawcy, musisz być zalogowany.
      </p>
      <div className="flex justify-center mt-4">
        <Link href="/account/login" className="inline-block">
          <Button variant="filled">Zaloguj się</Button>
        </Link>
      </div>
    </div>
  )
}
