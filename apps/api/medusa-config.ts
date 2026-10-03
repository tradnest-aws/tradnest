import fs from 'fs'
import path from 'path'
import { createRequire } from 'module'
import { loadEnv } from '@medusajs/framework/utils'
import { withMercur } from '@mercurjs/core'
import { tradnestAdminBrandPlugin } from './admin-brand/vite-plugin'

// The admin bundle is compiled from apps/api, which does not depend on React.
// Bun keeps React 18 next to @medusajs/dashboard, so point Vite there.
function react18FromDashboard(pkg: 'react' | 'react-dom'): string | undefined {
  const dashboardPkg = path.resolve(
    process.cwd(),
    'node_modules/@medusajs/dashboard/package.json'
  )
  if (!fs.existsSync(dashboardPkg)) return undefined
  try {
    const req = createRequire(dashboardPkg)
    const dir = path.dirname(req.resolve(`${pkg}/package.json`))
    const version = JSON.parse(
      fs.readFileSync(path.join(dir, 'package.json'), 'utf8')
    ).version as string
    return version.startsWith('18.') ? dir : undefined
  } catch {
    return undefined
  }
}

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379'

module.exports = withMercur({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: REDIS_URL,
    // Production defaults to Secure cookies. This host is HTTP until TLS is
    // on, so the admin SPA's POST /auth/session would never persist connect.sid
    // and login would appear to succeed then bounce back to /app/login.
    cookieOptions: {
      sameSite: "lax",
      secure: process.env.COOKIE_SECURE === "true",
      httpOnly: true,
      path: "/",
    },
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      vendorCors: process.env.VENDOR_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    }
  },
  admin: {
    // The public host serves a built dashboard from nginx. Leaving Vite's
    // dev server on makes /app return an empty #medusa shell.
    disable: process.env.DISABLE_MEDUSA_ADMIN === "true",
    // nginx fronts a public host; Vite's default localhost-only allowlist
    // blocks /app when the API runs `medusa develop` on this box.
    vite: (config: {
      server?: Record<string, unknown>
      resolve?: { alias?: unknown; dedupe?: string[] }
    }) => {
      const reactDir = react18FromDashboard('react')
      const reactDomDir = react18FromDashboard('react-dom')
      const alias: { find: string | RegExp; replacement: string }[] = []
      if (reactDir) {
        alias.push(
          {
            find: 'react/jsx-dev-runtime',
            replacement: path.join(reactDir, 'jsx-dev-runtime.js'),
          },
          {
            find: 'react/jsx-runtime',
            replacement: path.join(reactDir, 'jsx-runtime.js'),
          },
          { find: /^react$/, replacement: reactDir }
        )
      }
      if (reactDomDir) {
        alias.push(
          {
            find: 'react-dom/client',
            replacement: path.join(reactDomDir, 'client.js'),
          },
          { find: /^react-dom$/, replacement: reactDomDir }
        )
      }
      return {
        ...config,
        resolve: {
          ...config.resolve,
          alias,
          dedupe: ['react', 'react-dom'],
        },
        server: {
          ...config.server,
          allowedHosts: true,
        },
        // Replaces the spread `plugins` array. Vite merges this with the
        // admin bundler's own plugins, so only the brand plugin is added.
        plugins: [tradnestAdminBrandPlugin()],
      }
    },
  },
  featureFlags: {
    seller_registration: true
  },
  modules: [
    {
      resolve: '@mercurjs/core/modules/admin-ui',
      options: {
        appDir: '../admin',
        path: '/admin',
        disable: true
      }
    },
    {
      resolve: '@mercurjs/core/modules/vendor-ui',
      options: {
        appDir: '../vendor',
        path: '/seller',
        disable: true
      }
    },
    {
      resolve: '@medusajs/medusa/cache-redis',
      options: { redisUrl: REDIS_URL },
    },
    {
      resolve: '@medusajs/medusa/event-bus-redis',
      options: { redisUrl: REDIS_URL },
    },
    {
      resolve: '@medusajs/medusa/workflow-engine-redis',
      options: { redis: { url: REDIS_URL } },
    },
    {
      resolve: '@medusajs/medusa/locking',
      options: {
        providers: [
          {
            resolve: '@medusajs/medusa/locking-redis',
            id: 'locking-redis',
            is_default: true,
            options: { redisUrl: REDIS_URL },
          },
        ],
      },
    },
    {
      resolve: '@medusajs/medusa/file',
      options: {
        providers: [
          {
            resolve: '@medusajs/medusa/file-local',
            id: 'local',
            options: {
              // The local provider bakes this into every uploaded file URL.
              // It must be the publicly reachable origin in production, or
              // images resolve to localhost and render broken.
              backend_url: process.env.FILE_BACKEND_URL || 'http://localhost:9000/static',
            },
          },
        ],
      },
    },
  ],
})
