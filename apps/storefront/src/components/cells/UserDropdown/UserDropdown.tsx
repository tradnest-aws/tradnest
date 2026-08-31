"use client"

import {
  Divider,
  LogoutButton,
  NavigationItem,
} from "@/components/atoms"
import { Dropdown } from "@/components/molecules"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { ProfileIcon } from "@/icons"
import { useState } from "react"
import { useCopy } from "@/lib/i18n/useCopy"

export const UserDropdown = ({
  isLoggedIn,
}: {
  isLoggedIn: boolean
}) => {
  const [open, setOpen] = useState(false)
  const t = useCopy()

  return (
    <div
      className="relative"
      onMouseOver={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
    >
      <LocalizedClientLink
        href={isLoggedIn ? "/user" : "/login"}
        className="relative"
        aria-label="Go to user profile"
      >
        <ProfileIcon size={20} />
      </LocalizedClientLink>
      <Dropdown show={open}>
        {isLoggedIn ? (
          <div className="p-1">
            <div className="lg:w-[200px]">
              <h3 className="uppercase heading-xs border-b p-4">
                {t.buyerAccount}
              </h3>
            </div>
            <NavigationItem href="/user/orders">{t.orders}</NavigationItem>
            <NavigationItem href="/user/quotes">{t.quoteRequests}</NavigationItem>
            <NavigationItem href="/user/addresses">{t.addresses}</NavigationItem>
            <Divider />
            <NavigationItem href="/user/settings">{t.settings}</NavigationItem>
            <LogoutButton />
          </div>
        ) : (
          <div className="p-1">
            <NavigationItem href="/login">{t.login}</NavigationItem>
            <NavigationItem href="/register">{t.createBuyerAccount}</NavigationItem>
          </div>
        )}
      </Dropdown>
    </div>
  )
}
