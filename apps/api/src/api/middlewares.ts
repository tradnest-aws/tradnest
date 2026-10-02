import { defineMiddlewares } from "@medusajs/medusa"
import { forceHttpSessionCookie } from "./utils/http-session-cookie"

export default defineMiddlewares({
  routes: [
    {
      matcher: "*",
      middlewares: [forceHttpSessionCookie],
    },
  ],
})
