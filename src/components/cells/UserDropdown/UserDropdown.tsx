"use client"

import { Divider, LogoutButton, NavigationItem } from "@/components/atoms"
import { Dropdown } from "@/components/molecules"
import { Link } from "@/i18n/routing"
import { ProfileIcon } from "@/icons"
import { HttpTypes } from "@medusajs/types"
import { useState } from "react"

export const UserDropdown = ({
  user,
}: {
  user: HttpTypes.StoreCustomer | null
}) => {
  const [open, setOpen] = useState(false)

  return (
    <div
      className="relative"
      onMouseOver={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
    >
      <Link href="/user" className="relative">
        <ProfileIcon size={20} />
      </Link>
      <Dropdown show={open}>
        {user ? (
          <div className="p-1">
            <div className="lg:w-[200px]">
              <h3 className="uppercase heading-xs border-b p-4">
                Twoje konto
              </h3>
            </div>
            <NavigationItem href="/user/orders">Zamówienia</NavigationItem>
            <NavigationItem href="/user/addresses">Adresy</NavigationItem>
            <NavigationItem href="/user/reviews">Opinie</NavigationItem>
            <NavigationItem href="/user/wishlist">Lista życzeń</NavigationItem>
            <NavigationItem href="/user/messages">Wiadomości</NavigationItem>
            <Divider />
            <NavigationItem href="/user/settings">Ustawienia</NavigationItem>
            <LogoutButton />
          </div>
        ) : (
          <div className="p-1">
            <NavigationItem href="/user">Zaloguj się</NavigationItem>
            <NavigationItem href="/user/register">Zarejestruj się</NavigationItem>
          </div>
        )}
      </Dropdown>
    </div>
  )
}
