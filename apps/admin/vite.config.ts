import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { mercurDashboardPlugin } from '@mercurjs/dashboard-sdk/vite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backendUrl = env.VITE_MERCUR_BACKEND_URL || env.MERCUR_BACKEND_URL
  const vendorUrl = env.VITE_MERCUR_VENDOR_URL || env.MERCUR_VENDOR_URL
  const base = env.VITE_ADMIN_BASE || '/admin/'

  return {
    resolve: {
      alias: {
        '@mercurjs/admin/extension-targets': path.join(
          rootDir,
          'node_modules/@mercurjs/admin/dist/extension-targets.js',
        ),
      },
    },
    plugins: [
      react(),
      mercurDashboardPlugin({
        medusaConfigPath: '../api/medusa-config.ts',
        name: 'Tradnest',
        i18n: { defaultLanguage: 'he' },
        logo: '/tradnest-icon.png',
        base,
        ...(backendUrl ? { backendUrl } : {}),
        ...(vendorUrl ? { vendorUrl } : {}),
      }),
      {
        name: 'tradnest-admin-base',
        config: () => ({
          base,
        }),
      },
    ],
  }
})
