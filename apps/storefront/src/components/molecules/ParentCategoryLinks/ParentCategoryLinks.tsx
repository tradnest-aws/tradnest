"use client"

import Image from "next/image"
import { useState } from "react"
import { useParams } from "next/navigation"

import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import {
  AZTRADE_CATEGORY_TREE,
  findAztradeCategory,
  type AztradeParentCategory,
} from "@/lib/catalog/aztrade-categories"
import { cn } from "@/lib/utils"

const isDesktop = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(min-width: 1024px)").matches

function ChildMark() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      aria-hidden="true"
      className="text-action"
    >
      <rect x="1.5" y="1.5" width="5.5" height="5.5" rx="1.2" fill="currentColor" />
      <rect x="9" y="1.5" width="5.5" height="5.5" rx="1.2" fill="currentColor" opacity="0.45" />
      <rect x="1.5" y="9" width="5.5" height="5.5" rx="1.2" fill="currentColor" opacity="0.45" />
      <rect x="9" y="9" width="5.5" height="5.5" rx="1.2" fill="currentColor" opacity="0.25" />
    </svg>
  )
}

function Chevron() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      aria-hidden="true"
      className="shrink-0 text-current"
    >
      <path
        d="M10 3.5 5.5 8 10 12.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ParentRow({
  parent,
  count,
  highlighted,
  onHover,
  onTap,
}: {
  parent: AztradeParentCategory
  count: number
  highlighted: boolean
  onHover: () => void
  onTap: () => void
}) {
  return (
    <LocalizedClientLink
      href={`/categories/${parent.handle}`}
      onMouseEnter={onHover}
      onFocus={onHover}
      onClick={(event) => {
        if (!isDesktop()) {
          event.preventDefault()
          onTap()
        }
      }}
      data-testid={`category-mega-parent-${parent.handle}`}
      data-highlighted={highlighted ? "true" : "false"}
      className={cn(
        "flex items-center gap-2 rounded-xl px-2 py-2 text-primary",
        highlighted
          ? "bg-secondary font-semibold text-action"
          : "hover:bg-secondary"
      )}
    >
      <Image
        src={parent.icon}
        alt=""
        width={36}
        height={36}
        className="size-9 shrink-0 rounded-full object-cover"
      />
      <span className="min-w-0 flex-1 text-start label-md leading-snug">
        {parent.name}
      </span>
      <span
        className="label-sm tabular-nums text-secondary"
        data-testid={`category-mega-count-${parent.handle}`}
      >
        {count}
      </span>
      <Chevron />
    </LocalizedClientLink>
  )
}

export const ParentCategoryLinks = ({
  counts,
}: {
  counts: Record<string, number>
}) => {
  const { category } = useParams<{ category?: string }>()
  const active = category ? findAztradeCategory(category) : null
  const activeParent = active?.parent.handle
  const [openHandle, setOpenHandle] = useState<string | null>(null)

  const highlighted =
    AZTRADE_CATEGORY_TREE.find((parent) => parent.handle === openHandle) ??
    null

  const closeOnDesktopLeave = () => {
    if (isDesktop()) setOpenHandle(null)
  }

  return (
    <nav
      className="relative"
      aria-label="Parent categories"
      data-testid="parent-category-bar"
      onMouseLeave={closeOnDesktopLeave}
    >
      <div className="flex items-center gap-1 overflow-x-auto">
        {AZTRADE_CATEGORY_TREE.map((parent) => {
          const isActive = parent.handle === activeParent
          return (
            <LocalizedClientLink
              key={parent.handle}
              href={`/categories/${parent.handle}`}
              onMouseEnter={() => setOpenHandle(parent.handle)}
              onClick={(event) => {
                if (!isDesktop()) {
                  event.preventDefault()
                  setOpenHandle((current) =>
                    current === parent.handle ? null : parent.handle
                  )
                }
              }}
              className={cn(
                "label-md whitespace-nowrap rounded-full px-3 py-2 text-primary hover:text-action",
                (isActive || openHandle === parent.handle) &&
                  "bg-secondary font-semibold text-action"
              )}
              data-testid={`parent-category-${parent.handle}`}
              aria-expanded={openHandle === parent.handle}
            >
              {parent.name}
            </LocalizedClientLink>
          )
        })}
      </div>

      {highlighted ? (
        <div
          className="absolute inset-x-0 top-full z-40 pt-2"
          data-testid="category-mega-menu"
          dir="rtl"
        >
          <div className="grid max-h-[70vh] grid-cols-[minmax(148px,280px)_minmax(0,1fr)] overflow-hidden rounded-2xl border border-primary/10 bg-white text-start shadow-lg">
            <ul
              className="flex flex-col gap-0.5 overflow-y-auto border-e border-primary/10 bg-[rgb(var(--bg-secondary))] p-2"
              data-testid="category-mega-parents"
            >
              {AZTRADE_CATEGORY_TREE.map((parent) => (
                <li key={parent.handle}>
                  <ParentRow
                    parent={parent}
                    count={counts[parent.handle] ?? 0}
                    highlighted={parent.handle === highlighted.handle}
                    onHover={() => setOpenHandle(parent.handle)}
                    onTap={() => setOpenHandle(parent.handle)}
                  />
                </li>
              ))}
            </ul>
            <div className="overflow-y-auto bg-white p-4" data-testid="category-mega-children">
              <div className="mb-3 flex items-center justify-between gap-3">
                <LocalizedClientLink
                  href={`/categories/${highlighted.handle}`}
                  className="heading-sm text-primary hover:text-action"
                  data-testid="category-mega-title"
                >
                  {highlighted.name}
                </LocalizedClientLink>
                <button
                  type="button"
                  className="label-sm rounded-full px-2 py-1 text-secondary lg:hidden"
                  onClick={() => setOpenHandle(null)}
                >
                  סגור
                </button>
              </div>
              <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2 xl:grid-cols-3">
                {highlighted.children.map((child) => {
                  const count = counts[child.handle] ?? 0
                  return (
                    <li key={child.handle}>
                      <LocalizedClientLink
                        href={`/categories/${child.handle}`}
                        className="flex items-center gap-2 rounded-xl px-2 py-2 label-md text-primary hover:bg-secondary"
                        data-testid={`parent-category-child-${child.handle}`}
                      >
                        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-secondary">
                          <ChildMark />
                        </span>
                        <span className="min-w-0 flex-1 text-start">{child.name}</span>
                        {count > 0 ? (
                          <span className="label-sm tabular-nums text-secondary">
                            {count}
                          </span>
                        ) : null}
                      </LocalizedClientLink>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
        </div>
      ) : null}
    </nav>
  )
}
