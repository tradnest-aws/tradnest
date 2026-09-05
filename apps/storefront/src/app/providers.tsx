"use client"

import { CartProvider, SessionProvider } from "@/components/providers"
import { Cart } from "@/types/cart"
import type React from "react"

import { PropsWithChildren } from "react"

interface ProvidersProps extends PropsWithChildren {
  cart: Cart | null
  isLoggedIn: boolean
}

export function Providers({ children, cart, isLoggedIn }: ProvidersProps) {
  return (
    <SessionProvider isLoggedIn={isLoggedIn}>
      <CartProvider cart={cart}>{children}</CartProvider>
    </SessionProvider>
  )
}
