export function resolveMessagesView({
  appId,
  sessionAlive,
  timedOut,
}: {
  appId: string
  sessionAlive: boolean
  timedOut: boolean
}): "empty" | "loading" | "inbox" {
  if (!appId || (!sessionAlive && timedOut)) return "empty"
  if (!sessionAlive) return "loading"
  return "inbox"
}
