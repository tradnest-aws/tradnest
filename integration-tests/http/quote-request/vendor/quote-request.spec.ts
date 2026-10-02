import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { MercurModules } from "@mercurjs/types"

import { createSellerUser } from "../../../helpers/create-seller-user"

jest.setTimeout(60000)

const seedQuoteRequest = async (
  container: MedusaContainer,
  sellerId: string,
  overrides: Record<string, unknown> = {}
) => {
  const service = container.resolve(MercurModules.QUOTE_REQUEST)
  const link = container.resolve(ContainerRegistrationKeys.LINK)

  const quoteRequest = await service.createQuoteRequests({
    quantity: 25,
    product_id: "prod_seed",
    product_title: "Bulk fasteners",
    status: "pending",
    ...overrides,
  })

  await link.create([
    {
      [MercurModules.SELLER]: { seller_id: sellerId },
      [MercurModules.QUOTE_REQUEST]: { quote_request_id: quoteRequest.id },
    },
  ])

  return quoteRequest
}

medusaIntegrationTestRunner({
  testSuite: ({ getContainer, api }) => {
    describe("Vendor - Quote requests", () => {
      let appContainer: MedusaContainer
      let sellerHeaders: Record<string, unknown>
      let sellerId: string

      beforeAll(() => {
        appContainer = getContainer()
      })

      beforeEach(async () => {
        const result = await createSellerUser(appContainer, {
          email: "quotes-seller@test.com",
          name: "Quote Seller",
        })
        sellerHeaders = result.headers
        sellerId = (result.seller as { id: string }).id
      })

      it("lists only the authenticated seller's quote requests", async () => {
        await seedQuoteRequest(appContainer, sellerId)

        const other = await createSellerUser(appContainer, {
          email: "other-quotes@test.com",
          name: "Other Seller",
        })
        await seedQuoteRequest(appContainer, (other.seller as { id: string }).id, {
          product_title: "Not mine",
        })

        const response = await api.get("/vendor/quote-requests", sellerHeaders)

        expect(response.status).toEqual(200)
        expect(response.data.count).toEqual(1)
        expect(response.data.quote_requests[0].product_title).toEqual(
          "Bulk fasteners"
        )
      })

      it("lets a seller send a quoted unit price", async () => {
        const quoteRequest = await seedQuoteRequest(appContainer, sellerId)

        const response = await api.post(
          `/vendor/quote-requests/${quoteRequest.id}`,
          {
            status: "quoted",
            quoted_unit_amount: 1299,
            seller_note: "FOB warehouse, 14 day lead time",
          },
          sellerHeaders
        )

        expect(response.status).toEqual(200)
        expect(response.data.quote_request.status).toEqual("quoted")
        expect(response.data.quote_request.quoted_unit_amount).toEqual(1299)
        expect(response.data.quote_request.seller_note).toEqual(
          "FOB warehouse, 14 day lead time"
        )
      })

      it("404s for a quote that belongs to another seller", async () => {
        const other = await createSellerUser(appContainer, {
          email: "foreign-quotes@test.com",
          name: "Foreign Seller",
        })
        const foreign = await seedQuoteRequest(
          appContainer,
          (other.seller as { id: string }).id
        )

        const response = await api
          .get(`/vendor/quote-requests/${foreign.id}`, sellerHeaders)
          .catch((e: { response: { status: number } }) => e.response)

        expect(response.status).toEqual(404)
      })
    })
  },
})
