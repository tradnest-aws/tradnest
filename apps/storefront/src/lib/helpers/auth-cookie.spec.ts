import { expect, test } from 'bun:test'

import { shouldUseSecureAuthCookie } from './auth-cookie'

test('does not mark the auth cookie Secure on HTTP production', () => {
  expect(
    shouldUseSecureAuthCookie({
      forwardedProto: 'http',
    })
  ).toBe(false)
})

test('marks the auth cookie Secure when the request is HTTPS', () => {
  expect(
    shouldUseSecureAuthCookie({
      forwardedProto: 'https',
    })
  ).toBe(true)
})

test('COOKIE_SECURE overrides the forwarded protocol', () => {
  expect(
    shouldUseSecureAuthCookie({
      cookieSecureEnv: 'true',
      forwardedProto: 'http',
    })
  ).toBe(true)
  expect(
    shouldUseSecureAuthCookie({
      cookieSecureEnv: 'false',
      forwardedProto: 'https',
    })
  ).toBe(false)
})
