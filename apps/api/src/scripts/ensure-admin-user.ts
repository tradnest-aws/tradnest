import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

const SUPER_ADMIN_ROLE_ID = "role_super_admin"

type AuthRegisterResult = {
  success?: boolean
  authIdentity?: { id: string }
}

type ProviderIdentity = {
  id: string
  auth_identity_id?: string
}

type UserRow = {
  id: string
  email?: string
}

type UserModule = {
  listUsers: (selector: { email: string }) => Promise<UserRow[]>
  createUsers: (data: {
    email: string
    first_name: string
    last_name: string
  }) => Promise<UserRow | UserRow[]>
}

type AuthModule = {
  listProviderIdentities: (selector: {
    entity_id: string
    provider: string
  }) => Promise<ProviderIdentity[]>
  register: (
    provider: string,
    payload: { body: { email: string; password: string } }
  ) => Promise<AuthRegisterResult>
  updateProviderIdentities: (data: {
    id: string
    provider_metadata: { password: string }
  }) => Promise<unknown>
  updateAuthIdentities: (data: {
    id: string
    app_metadata: { user_id: string }
  }) => Promise<unknown>
}

type LinkModule = {
  create: (data: Record<string, Record<string, string>>) => Promise<unknown>
}

export default async function ensureAdminUser({
  container,
}: ExecArgs): Promise<void> {
  const email = (
    process.env.TRADNEST_ADMIN_EMAIL || "admin@tradnest.il"
  ).toLowerCase()
  const password = process.env.TRADNEST_ADMIN_PASSWORD || "supersecret"

  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const userModule = container.resolve(Modules.USER) as UserModule
  const authModule = container.resolve(Modules.AUTH) as AuthModule
  const link = container.resolve(ContainerRegistrationKeys.LINK) as LinkModule

  const existingUsers = await userModule.listUsers({ email })
  let user = existingUsers[0]
  if (!user) {
    const created = await userModule.createUsers({
      email,
      first_name: "Tradnest",
      last_name: "Admin",
    })
    user = Array.isArray(created) ? created[0] : created
    logger.info(`Created Medusa admin user ${email}`)
  } else {
    logger.info(`Medusa admin user ${email} already exists`)
  }

  const identities = await authModule.listProviderIdentities({
    entity_id: email,
    provider: "emailpass",
  })

  let authIdentityId = identities[0]?.auth_identity_id

  if (!authIdentityId) {
    const registerResponse = await authModule.register("emailpass", {
      body: { email, password },
    })
    if (!registerResponse.success || !registerResponse.authIdentity) {
      throw new Error(`Failed to register emailpass identity for ${email}`)
    }
    authIdentityId = registerResponse.authIdentity.id
  } else if (identities[0]) {
    const scrypt = await import("scrypt-kdf")
    const passwordHash = await scrypt.default.kdf(password, {
      logN: 15,
      r: 8,
      p: 1,
    })
    await authModule.updateProviderIdentities({
      id: identities[0].id,
      provider_metadata: {
        password: passwordHash.toString("base64"),
      },
    })
    logger.info(`Reset password for ${email}`)
  }

  await authModule.updateAuthIdentities({
    id: authIdentityId,
    app_metadata: { user_id: user.id },
  })

  try {
    await link.create({
      [Modules.USER]: { user_id: user.id },
      [Modules.RBAC]: { rbac_role_id: SUPER_ADMIN_ROLE_ID },
    })
  } catch {
    logger.info("Super-admin RBAC role already linked")
  }

  console.log(`TRADNEST_ADMIN_EMAIL=${email}`)
  console.log("TRADNEST_ADMIN_PASSWORD=supersecret (override with TRADNEST_ADMIN_PASSWORD)")
}
