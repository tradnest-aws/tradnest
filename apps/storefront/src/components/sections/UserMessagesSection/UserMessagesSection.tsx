"use client"

import { Card } from "@/components/atoms"
import { useCopy } from "@/lib/i18n/useCopy"
import { Inbox, useSession } from "@talkjs/react"
import { useCallback, useEffect, useState } from "react"
import Talk from "talkjs"

import { resolveMessagesView } from "./messages-view"

const TALKJS_APP_ID = process.env.NEXT_PUBLIC_TALKJS_APP_ID || ""
const SESSION_WAIT_MS = 8000

export const UserMessagesSection = () => {
  const t = useCopy()
  const session = useSession()
  const sessionAlive = Boolean(session?.isAlive)
  const [timedOut, setTimedOut] = useState(false)

  useEffect(() => {
    if (!TALKJS_APP_ID || sessionAlive) {
      setTimedOut(false)
      return
    }
    const timer = window.setTimeout(() => setTimedOut(true), SESSION_WAIT_MS)
    return () => window.clearTimeout(timer)
  }, [sessionAlive])

  const syncConversation = useCallback((active: Talk.Session) => {
    const conversation = active.getOrCreateConversation(
      `buyer-${active.me.id}`.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 50) ||
        "buyer"
    )
    conversation.setParticipant(active.me)
    return conversation
  }, [])

  const view = resolveMessagesView({
    appId: TALKJS_APP_ID,
    sessionAlive,
    timedOut,
  })

  if (view === "empty") {
    return (
      <Card className="p-6" data-testid="user-messages-empty">
        <p className="heading-sm mb-2">{t.noMessages}</p>
        <p className="label-md text-secondary">{t.noMessagesHint}</p>
      </Card>
    )
  }

  if (view === "loading") {
    return (
      <div
        className="h-96 w-full flex items-center justify-center"
        data-testid="user-messages-loading"
      >
        {t.loading}
      </div>
    )
  }

  return (
    <div className="max-w-full h-[655px]" data-testid="user-messages-inbox">
      <Inbox
        syncConversation={syncConversation}
        className="h-full max-w-[760px] w-full"
      />
    </div>
  )
}
