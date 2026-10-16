"use client"

import { FormEvent, useState } from "react"

import { Button } from "@/components/atoms"
import { registerSeller } from "@/lib/data/seller-join"
import { useCopy } from "@/lib/i18n/useCopy"

export const JoinSellerForm = () => {
  const t = useCopy()
  const [error, setError] = useState("")
  const [done, setDone] = useState(false)
  const [pending, setPending] = useState(false)

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    setPending(true)
    setError("")
    const result = await registerSeller({
      companyName: String(data.get("company_name") || ""),
      firstName: String(data.get("first_name") || ""),
      lastName: String(data.get("last_name") || ""),
      email: String(data.get("email") || ""),
      password: String(data.get("password") || ""),
    })
    setPending(false)
    if (!result.ok) {
      const message = result.message.toLowerCase()
      setError(message.includes("already exists") ? t.emailExists : result.message)
      return
    }
    setDone(true)
  }

  if (done) {
    return (
      <p className="label-md text-primary" data-testid="join-seller-success">
        {t.sellerJoinDone}
      </p>
    )
  }

  return (
    <form
      method="post"
      action="/join-as-seller"
      onSubmit={onSubmit}
      className="grid grid-cols-1 gap-4 sm:grid-cols-2"
      data-testid="join-seller-form"
    >
      <label className="flex flex-col gap-1 label-md text-primary sm:col-span-2">
        {t.companyName}
        <input
          required
          name="company_name"
          className="rounded-xl border border-primary/15 bg-primary px-3 py-2 text-primary"
          data-testid="join-seller-company"
        />
      </label>
      <label className="flex flex-col gap-1 label-md text-primary">
        {t.firstName}
        <input
          required
          name="first_name"
          className="rounded-xl border border-primary/15 bg-primary px-3 py-2 text-primary"
          data-testid="join-seller-first-name"
        />
      </label>
      <label className="flex flex-col gap-1 label-md text-primary">
        {t.lastName}
        <input
          required
          name="last_name"
          className="rounded-xl border border-primary/15 bg-primary px-3 py-2 text-primary"
          data-testid="join-seller-last-name"
        />
      </label>
      <label className="flex flex-col gap-1 label-md text-primary">
        {t.email}
        <input
          required
          type="email"
          name="email"
          autoComplete="email"
          className="rounded-xl border border-primary/15 bg-primary px-3 py-2 text-primary"
          data-testid="join-seller-email"
        />
      </label>
      <label className="flex flex-col gap-1 label-md text-primary">
        {t.passwordLabel}
        <input
          required
          type="password"
          name="password"
          minLength={8}
          autoComplete="new-password"
          className="rounded-xl border border-primary/15 bg-primary px-3 py-2 text-primary"
          data-testid="join-seller-password"
        />
      </label>
      {error ? (
        <p className="label-md text-negative sm:col-span-2" data-testid="join-seller-error">
          {error}
        </p>
      ) : null}
      <div className="sm:col-span-2">
        <Button
          type="submit"
          size="large"
          loading={pending}
          disabled={pending}
          className="rounded-full"
          data-testid="join-seller-submit"
        >
          {t.sellerRegisterCta}
        </Button>
      </div>
    </form>
  )
}
