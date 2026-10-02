const AVATAR_MARK = "M238.088 51.1218"
const LOGO_MARK = "M30.85 6.16832"

const TRADNEST_ICON = `jsx("img", { src: "/app/tradnest-icon.png", alt: "Tradnest", className: "size-12 object-contain" })`

export function isDashboardModule(id: string): boolean {
  return id.includes("@medusajs/dashboard") || id.includes("@medusajs+dashboard")
}

/**
 * The published dashboard bundle inlines the Medusa mark and the word Medusa.
 * Swap the visible brand, and leave the JS SDK import (`import Medusa` /
 * `new Medusa`) alone so the admin client still constructs.
 */
export function rebrandDashboardModule(code: string): string {
  let next = code
  next = replaceSvgCallContaining(next, AVATAR_MARK, TRADNEST_ICON)
  next = replaceSvgCallContaining(next, LOGO_MARK, TRADNEST_ICON)
  if (!next.includes("Medusa")) return next
  return next.replace(/\bMedusa\b/g, (match, offset: number, source: string) => {
    const before = source.slice(Math.max(0, offset - 16), offset)
    const after = source.slice(offset + match.length, offset + match.length + 8)
    if (/(?:import|new)\s+$/.test(before)) return match
    if (after.startsWith(" from") || after.startsWith("({")) return match
    return "Tradnest"
  })
}

export function rebrandAdminHtml(html: string): string {
  const icon = '<link rel="icon" type="image/png" href="/app/tradnest-icon.png" />'
  let out = html
  if (/<title>[\s\S]*?<\/title>/i.test(out)) {
    out = out.replace(/<title>[\s\S]*?<\/title>/i, "<title>Tradnest</title>")
  } else {
    out = out.replace(/<head>/i, "<head>\n            <title>Tradnest</title>")
  }
  if (/<link\s+rel="icon"[^>]*>/i.test(out)) {
    out = out.replace(/<link\s+rel="icon"[^>]*>/i, icon)
  } else {
    out = out.replace(/<head>/i, `<head>\n            ${icon}`)
  }
  return out
}

function replaceSvgCallContaining(
  code: string,
  marker: string,
  replacement: string
): string {
  const markerAt = code.indexOf(marker)
  if (markerAt < 0) return code
  const start = findSvgCallStart(code, markerAt)
  if (start < 0) return code
  const end = findCallEnd(code, start)
  if (end < 0) return code
  return code.slice(0, start) + replacement + code.slice(end)
}

function findSvgCallStart(code: string, markerAt: number): number {
  const region = code.slice(0, markerAt)
  const re = /jsx[s]?\(\s*"svg"/g
  let last = -1
  let match: RegExpExecArray | null
  while ((match = re.exec(region))) last = match.index
  return last
}

function findCallEnd(code: string, start: number): number {
  const open = code.indexOf("(", start)
  if (open < 0) return -1
  let depth = 0
  let i = open
  let quote: string | null = null
  while (i < code.length) {
    const char = code[i]
    if (quote) {
      if (char === "\\") {
        i += 2
        continue
      }
      if (char === quote) quote = null
      i++
      continue
    }
    if (char === '"' || char === "'" || char === "`") {
      quote = char
      i++
      continue
    }
    if (char === "(") depth++
    else if (char === ")") {
      depth--
      if (depth === 0) return i + 1
    }
    i++
  }
  return -1
}
