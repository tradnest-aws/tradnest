import { defineConfig } from "tsup"

export default defineConfig({
    entry: ["src/index.ts", "src/vite.ts"],
    format: ["esm", "cjs"],
    dts: process.env.TSUP_DTS !== "0",
    clean: true,
    external: ["zod", "react"],
})
