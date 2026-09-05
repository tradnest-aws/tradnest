import { expect, test } from 'bun:test'
import { resolvePublicOrigin } from './public-origin'

test('prefers a non-loopback NEXT_PUBLIC_BASE_URL', () => {
  expect(
    resolvePublicOrigin({
      configuredBaseUrl: 'http://13.60.11.98',
      fallbackOrigin: 'http://localhost:3000',
    })
  ).toBe('http://13.60.11.98')
})

test('uses x-forwarded-host when base URL is localhost', () => {
  expect(
    resolvePublicOrigin({
      configuredBaseUrl: 'http://localhost:3000',
      forwardedHost: '13.60.11.98',
      forwardedProto: 'http',
      fallbackOrigin: 'http://127.0.0.1:3000',
    })
  ).toBe('http://13.60.11.98')
})
