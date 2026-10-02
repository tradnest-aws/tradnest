import fs from "fs"
import path from "path"

import {
  isDashboardModule,
  rebrandAdminHtml,
  rebrandDashboardModule,
} from "./rebrand"

const ICON_PATH = path.resolve(
  __dirname,
  "../../storefront/public/tradnest-icon.png"
)

export function tradnestAdminBrandPlugin() {
  return {
    name: "tradnest-admin-brand",
    enforce: "pre" as const,
    transform(code: string, id: string) {
      if (!isDashboardModule(id) || !code) return null
      const next = rebrandDashboardModule(code)
      return next === code ? null : next
    },
    transformIndexHtml(html: string) {
      return rebrandAdminHtml(html)
    },
    generateBundle(this: { emitFile: (file: object) => void }) {
      if (!fs.existsSync(ICON_PATH)) return
      this.emitFile({
        type: "asset",
        fileName: "tradnest-icon.png",
        source: fs.readFileSync(ICON_PATH),
      })
    },
  }
}
