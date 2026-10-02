import { expect, test } from 'bun:test'

import { resolveLoginSubmit } from './login-submit'

const fallback = 'An error occurred. Please try again.'

test('continues into the account after a successful login', () => {
  expect(resolveLoginSubmit({ success: true }, fallback)).toEqual({
    type: 'continue',
    href: '/user',
  })
})

test('stays on the form and surfaces the server message after a failed login', () => {
  expect(
    resolveLoginSubmit(
      { success: false, message: 'Invalid email or password' },
      fallback
    )
  ).toEqual({
    type: 'error',
    message: 'Invalid email or password',
  })
})

test('uses a fallback message when the failure has none', () => {
  expect(resolveLoginSubmit({ success: false }, fallback)).toEqual({
    type: 'error',
    message: fallback,
  })
})
