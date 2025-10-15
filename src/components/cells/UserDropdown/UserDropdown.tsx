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
      <Link href="/user" className="relative" prefetch={true}>
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
            <NavigationItem href="/user/orders" prefetch={true}>Zamówienia</NavigationItem>
            <NavigationItem href="/user/addresses" prefetch={true}>Adresy</NavigationItem>
            <NavigationItem href="/user/reviews" prefetch={true}>Recenzje</NavigationItem>
            <NavigationItem href="/user/wishlist" prefetch={true}>Lista życzeń</NavigationItem>
            <NavigationItem href="/user/messages" prefetch={true}>Wiadomości</NavigationItem>
            <Divider />
            <NavigationItem href="/user/settings" prefetch={true}>Ustawienia</NavigationItem>
            <LogoutButton />
          </div>
        ) : (
          <div className="p-1">
            <NavigationItem href="/user" prefetch={true}>Zaloguj się</NavigationItem>
            <NavigationItem href="/user/register" prefetch={true}>Zarejestruj się</NavigationItem>
          </div>
        )}
      </Dropdown>
    </div>
  )
}
