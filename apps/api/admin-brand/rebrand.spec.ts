import { expect, test } from "bun:test"

import { rebrandAdminHtml, rebrandDashboardModule } from "./rebrand"

test("replaces the Medusa welcome copy and document title", () => {
  const input = [
    'var DEFAULT_TITLE = "Medusa";',
    "return `${pageTitle} - Medusa`;",
    'title: "Welcome to Medusa"',
    'title: "ברוכים הבאים ל-Medusa"',
  ].join("\n")

  const out = rebrandDashboardModule(input)

  expect(out).toContain('DEFAULT_TITLE = "Tradnest"')
  expect(out).toContain("${pageTitle} - Tradnest")
  expect(out).toContain("Welcome to Tradnest")
  expect(out).toContain("ברוכים הבאים ל-Tradnest")
  expect(out).not.toContain("Medusa")
})

test("keeps the Medusa JS SDK constructor", () => {
  const input = [
    'import Medusa from "@medusajs/js-sdk";',
    "var sdk = new Medusa({",
    "  baseUrl: backendUrl,",
    "});",
  ].join("\n")

  const out = rebrandDashboardModule(input)

  expect(out).toContain('import Medusa from "@medusajs/js-sdk"')
  expect(out).toContain("new Medusa({")
})

test("swaps the login mark for the Tradnest icon", () => {
  const input = [
    'import { jsx, jsxs } from "react/jsx-runtime";',
    'jsxs("svg", {',
    '  className: "rounded-[10px]",',
    "  children: [",
    '    jsx("path", { d: "M238.088 51.1218Lrest" })',
    "  ]",
    "})",
  ].join("\n")

  const out = rebrandDashboardModule(input)

  expect(out).not.toContain("M238.088")
  expect(out).toContain('src: "/app/tradnest-icon.png"')
  expect(out).toContain('alt: "Tradnest"')
})

test("swaps the reset-password mark for the Tradnest icon", () => {
  const input = 'jsx("svg", { children: jsx("path", { d: "M30.85 6.16832Lrest" }) })'
  const out = rebrandDashboardModule(input)

  expect(out).not.toContain("M30.85")
  expect(out).toContain("/app/tradnest-icon.png")
})

test("sets the admin document title and favicon", () => {
  const html = `<html><head>
            <link rel="icon" href="data:," data-placeholder-favicon />
        </head><body><div id="medusa"></div></body></html>`

  const out = rebrandAdminHtml(html)

  expect(out).toContain("<title>Tradnest</title>")
  expect(out).toContain('href="/app/tradnest-icon.png"')
  expect(out).not.toContain("data:,")
})
