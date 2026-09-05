import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import { MedusaContainer } from "@medusajs/framework/types"
import {
  generatePublishableKey,
  generateStoreHeaders,
} from "../../../helpers/create-admin-user"
import { createCustomerUser } from "../../../helpers/create-customer-user"
import { createSellerUser } from "../../../helpers/create-seller-user"

jest.setTimeout(60000)

medusaIntegrationTestRunner({
  testSuite: ({ getContainer, api }) => {
    describe("Store - Quote requests", () => {
      let appContainer: MedusaContainer
      let customerHeaders: Record<string, unknown>
      let storeHeaders: ReturnType<typeof generateStoreHeaders>
      let sellerId: string

      beforeAll(() => {
        appContainer = getContainer()
      })

      beforeEach(async () => {
        const publishableKey = await generatePublishableKey(appContainer)
        storeHeaders = generateStoreHeaders({ publishableKey })

        const customer = await createCustomerUser(appContainer, {
          email: "buyer@tradnest.test",
          first_name: "Buyer",
          last_name: "One",
        })
        customerHeaders = {
          headers: {
            ...storeHeaders.headers,
            ...customer.headers.headers,
          },
        }

        const seller = await createSellerUser(appContainer, {
          email: "supplier@tradnest.test",
          name: "Northwind Supply",
        })
        sellerId = (seller.seller as { id: string }).id
      })

      it("creates a quote request for the authenticated buyer", async () => {
        const response = await api.post(
          "/store/quote-requests",
          {
            seller_id: sellerId,
            product_id: "prod_steel_pipe",
            product_title: "Steel pipe 2 inch",
            quantity: 50,
            message: "Need net-30 pricing for Q4",
            company_name: "Harbor Logistics",
          },
          customerHeaders
        )

        expect(response.status).toEqual(201)
        expect(response.data.quote_request.status).toEqual("pending")
        expect(response.data.quote_request.quantity).toEqual(50)
        expect(response.data.quote_request.company_name).toEqual(
          "Harbor Logistics"
        )
      })

      it("lists only the authenticated buyer's quote requests", async () => {
        await api.post(
          "/store/quote-requests",
          {
            seller_id: sellerId,
            product_id: "prod_a",
            quantity: 10,
          },
          customerHeaders
        )

        const other = await createCustomerUser(appContainer, {
          email: "other-buyer@tradnest.test",
        })
        const otherHeaders = {
          headers: {
            ...storeHeaders.headers,
            ...other.headers.headers,
          },
        }
        await api.post(
          "/store/quote-requests",
          {
            seller_id: sellerId,
            product_id: "prod_b",
            quantity: 2,
          },
          otherHeaders
        )

        const response = await api.get("/store/quote-requests", customerHeaders)

        expect(response.status).toEqual(200)
        expect(response.data.count).toEqual(1)
        expect(response.data.quote_requests[0].product_id).toEqual("prod_a")
      })

      it("cancels a pending quote request", async () => {
        const created = await api.post(
          "/store/quote-requests",
          {
            seller_id: sellerId,
            product_id: "prod_c",
            quantity: 5,
          },
          customerHeaders
        )

        const response = await api.post(
          `/store/quote-requests/${created.data.quote_request.id}`,
          {},
          customerHeaders
        )

        expect(response.status).toEqual(200)
        expect(response.data.quote_request.status).toEqual("cancelled")
      })

      it("rejects unauthenticated quote requests", async () => {
        const response = await api
          .post(
            "/store/quote-requests",
            {
              seller_id: sellerId,
              product_id: "prod_d",
              quantity: 1,
            },
            storeHeaders
          )
          .catch((e: { response: { status: number } }) => e.response)

        expect(response.status).toEqual(401)
      })
    })
  },
})
