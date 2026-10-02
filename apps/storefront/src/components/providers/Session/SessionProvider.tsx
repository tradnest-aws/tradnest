"use client"

import { createContext, PropsWithChildren, useContext } from "react"

type SessionContextValue = {
  isLoggedIn: boolean
}

const SessionContext = createContext<SessionContextValue>({
  isLoggedIn: false,
})

export function SessionProvider({
  isLoggedIn,
  children,
}: PropsWithChildren<{ isLoggedIn: boolean }>) {
  return (
    <SessionContext.Provider value={{ isLoggedIn }}>
      {children}
    </SessionContext.Provider>
  )
}

export const useSession = () => useContext(SessionContext)
