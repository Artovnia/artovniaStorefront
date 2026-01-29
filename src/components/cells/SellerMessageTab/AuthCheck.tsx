"use client"

import { Button } from "@/components/atoms"
import Link from "next/link"
import { usePathname } from "next/navigation"

type AuthCheckProps = {
  children: React.ReactNode
  isAuthenticated: boolean
}

export function AuthCheck({ children, isAuthenticated }: AuthCheckProps) {
  const pathname = usePathname()
  
  // If the user is authenticated, render the children
  if (isAuthenticated) {
    return <>{children}</>
  }

  // Build redirect URL - encode current path to return after login
  const redirectUrl = `/user?redirect=${encodeURIComponent(pathname)}`

  // If the user is not authenticated, show a message and login button
  return (
    <div className="border rounded-sm p-6 text-center space-y-4">
      <h3 className="heading-sm ">Chcesz napisać do sprzedawcy? Zaloguj się, aby wysłać wiadomość.</h3>
    
      <div className="flex justify-center mt-4">
        <Link href={redirectUrl} className="inline-block">
          <Button variant="filled">Zaloguj się</Button>
        </Link>
      </div>
    </div>
  )
}
