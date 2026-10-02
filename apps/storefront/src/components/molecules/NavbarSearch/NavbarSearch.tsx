"use client"

import { SearchIcon } from "@/icons"
import { useSearchParams } from "next/navigation"
import { useState } from "react"
import { redirect } from "next/navigation"
import clsx from "clsx"
import { useCopy } from "@/lib/i18n/useCopy"

interface Props {
  className?: string
  variant?: "default" | "header" | "hero"
}

export const NavbarSearch = ({ className, variant = "default" }: Props) => {
  const t = useCopy()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(searchParams.get("query") || "")

  const handleSearch = () => {
    if (search) {
      redirect(`/categories?query=${search}`)
    } else {
      redirect(`/categories`)
    }
  }

  const submitHandler = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    handleSearch()
  }

  if (variant === "hero") {
    return (
      <form
        className={clsx(
          "flex w-full items-stretch overflow-hidden rounded-full bg-primary shadow-[0_12px_40px_rgba(16,24,40,0.12)]",
          className
        )}
        method="POST"
        onSubmit={submitHandler}
      >
        <input
          className="min-w-0 flex-1 bg-transparent px-5 py-4 text-primary outline-none label-md"
          placeholder={t.searchCatalog}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          type="search"
          aria-label={t.searchAria}
        />
        <button
          type="submit"
          className="m-1 inline-flex items-center gap-2 rounded-full bg-action px-5 py-3 font-semibold text-white hover:bg-action-hover"
        >
          <SearchIcon size={18} color="#ffffff" />
          <span>{t.heroSearchCta}</span>
        </button>
      </form>
    )
  }

  return (
    <form
      className={clsx("w-full", className)}
      method="POST"
      onSubmit={submitHandler}
    >
      <div className="flex items-center gap-2 rounded-full border border-primary/10 bg-secondary px-3 py-2 focus-within:border-action/40">
        <button
          type="submit"
          className="shrink-0 text-secondary"
          aria-label={t.searchAria}
        >
          <SearchIcon size={18} />
        </button>
        <input
          className="min-w-0 flex-1 bg-transparent text-primary outline-none label-md"
          placeholder={t.searchCatalog}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          type="search"
        />
      </div>
    </form>
  )
}
