/**
 * Production storefront processes set NODE_ENV=production, but this host is
 * served over HTTP until TLS is on. A Secure cookie is dropped by the browser,
 * so login looks successful and the next navigation is sent back to /login.
 */
export function shouldUseSecureAuthCookie(input: {
  cookieSecureEnv?: string
  forwardedProto?: string | null
}): boolean {
  if (input.cookieSecureEnv === 'false') return false
  if (input.cookieSecureEnv === 'true') return true

  const proto = input.forwardedProto?.split(',')[0]?.trim().toLowerCase()
  return proto === 'https'
}
