type PublicOriginInput = {
  configuredBaseUrl?: string
  forwardedHost?: string | null
  forwardedProto?: string | null
  host?: string | null
  fallbackOrigin: string
}

const isLoopbackHost = (host: string) => {
  const name = host.split(':')[0]?.toLowerCase() ?? ''
  return name === 'localhost' || name === '127.0.0.1' || name === '::1'
}

export function resolvePublicOrigin({
  configuredBaseUrl,
  forwardedHost,
  forwardedProto,
  host,
  fallbackOrigin,
}: PublicOriginInput): string {
  const configured = configuredBaseUrl?.trim().replace(/\/$/, '')
  if (configured) {
    try {
      if (!isLoopbackHost(new URL(configured).host)) {
        return configured
      }
    } catch {
      // ignore malformed NEXT_PUBLIC_BASE_URL
    }
  }

  const proto = forwardedProto?.split(',')[0]?.trim() || 'http'
  const forwarded = forwardedHost?.split(',')[0]?.trim()
  if (forwarded && !isLoopbackHost(forwarded)) {
    return `${proto}://${forwarded}`
  }

  const requestHost = host?.split(',')[0]?.trim()
  if (requestHost && !isLoopbackHost(requestHost)) {
    return `${proto}://${requestHost}`
  }

  return fallbackOrigin.replace(/\/$/, '')
}
