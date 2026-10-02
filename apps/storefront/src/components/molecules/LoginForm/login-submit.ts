export type LoginActionResult =
  | { success: true }
  | { success: false; message?: string }

export type LoginSubmitOutcome =
  | { type: 'continue'; href: '/user' }
  | { type: 'error'; message: string }

export function resolveLoginSubmit(
  result: LoginActionResult,
  fallbackMessage: string
): LoginSubmitOutcome {
  if (result.success) {
    return { type: 'continue', href: '/user' }
  }

  return {
    type: 'error',
    message: result.message || fallbackMessage,
  }
}
