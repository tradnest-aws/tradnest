"use client"
import {
  Badge,
  Card,
  Divider,
  LogoutButton,
  NavigationItem,
} from "@/components/atoms"
import { useUnreads } from "@talkjs/react"
import { usePathname } from "next/navigation"
import { useCopy } from "@/lib/i18n/useCopy"

const navigationHrefs = [
  { key: "orders" as const, href: "/user/orders" },
  { key: "quoteRequests" as const, href: "/user/quotes" },
  { key: "addresses" as const, href: "/user/addresses" },
]

export const UserNavigation = () => {
  const unreads = useUnreads()
  const path = usePathname()
  const t = useCopy()

  return (
    <Card className="h-min">
      {navigationHrefs.map((item) => (
        <NavigationItem
          key={item.href}
          href={item.href}
          active={path === item.href}
          className="relative"
        >
          {t[item.key]}
          {item.key === "messages" && Boolean(unreads?.length) && (
            <Badge className="absolute top-3 start-24 w-4 h-4 p-0">
              {unreads?.length}
            </Badge>
          )}
        </NavigationItem>
      ))}
      <Divider className="my-2" />
      <NavigationItem
        href={"/user/settings"}
        active={path === "/user/settings"}
      >
        {t.settings}
      </NavigationItem>
      <LogoutButton className="w-full text-start" />
    </Card>
  )
}
