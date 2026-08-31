"use client"

import { usePathname } from "next/navigation"

import { getCopy, localeFromPathname } from "./copy"

export const useCopy = () => {
  const pathname = usePathname()
  return getCopy(localeFromPathname(pathname))
}
