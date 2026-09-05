import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import {
  createApiKeysWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
} from "@medusajs/medusa/core-flows"

type PublishableApiKey = {
  id: string
  token?: string
}

export default async function ensurePublishableKey({
  container,
}: ExecArgs): Promise<void> {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  const {
    result: [created],
  } = await createApiKeysWorkflow(container).run({
    input: {
      api_keys: [
        {
          title: "Tradnest storefront",
          type: "publishable",
          created_by: "",
        },
      ],
    },
  })

  const key = created as PublishableApiKey
  if (!key?.token) {
    throw new Error("createApiKeysWorkflow did not return a token")
  }

  const { data: channels } = await query.graph({
    entity: "sales_channel",
    fields: ["id"],
  })
  const channelIds = (channels ?? [])
    .map((row) => row.id)
    .filter((id): id is string => typeof id === "string")

  if (channelIds.length) {
    try {
      await linkSalesChannelsToApiKeyWorkflow(container).run({
        input: {
          id: key.id,
          add: channelIds,
        },
      })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : ""
      if (!message.includes("already")) {
        throw error
      }
      logger.info("Sales channel already linked to API key")
    }
  }

  // Unique marker so the cutover script can parse the raw pk_ token.
  console.log(`TRADNEST_PUBLISHABLE_KEY=${key.token}`)
}
