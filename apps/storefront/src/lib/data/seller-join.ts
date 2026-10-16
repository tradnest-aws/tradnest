"use server"

import { sdk } from "../client"
import { setAuthToken } from "./cookies"

export type SellerJoinResult =
  | { ok: true }
  | { ok: false; message: string }

export async function registerSeller(input: {
  companyName: string
  firstName: string
  lastName: string
  email: string
  password: string
}): Promise<SellerJoinResult> {
  const backend = process.env.MEDUSA_BACKEND_URL || "http://127.0.0.1:9000"
  try {
    const registered = (await (sdk.auth.$actorType.$authProvider.register.mutate({
      $actorType: "member",
      $authProvider: "emailpass",
      email: input.email,
      password: input.password,
    } as never) as unknown as Promise<{ token?: string }>))

    const token = registered?.token
    if (!token) {
      return { ok: false, message: "Registration did not return a session." }
    }
    await setAuthToken(token)

    const response = await fetch(`${backend}/vendor/sellers`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: input.companyName,
        email: input.email,
        currency_code: "ils",
        first_name: input.firstName,
        last_name: input.lastName,
        member_email: input.email,
      }),
    })

    if (!response.ok) {
      const detail = await response.text()
      return { ok: false, message: detail || "Could not create the supplier." }
    }

    return { ok: true }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    return { ok: false, message }
  }
}
