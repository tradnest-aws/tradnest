import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import { MedusaContainer } from "@medusajs/framework/types"

import { createProductsWorkflow } from "@mercurjs/core/workflows"

import {
  adminHeaders,
  createAdminUser,
} from "../../../helpers/create-admin-user"

jest.setTimeout(60000)

/**
 * Regression: GET /admin/products (list + retrieve with Mercur defaults)
 * must not 400 on missing product_id columns (product_attribute / offer /
 * product_option). Dashboard product pages use the default field set.
 */
medusaIntegrationTestRunner({
  testSuite: ({ getContainer, api, dbConnection }) => {
    describe("Admin - product list and retrieve", () => {
      let appContainer: MedusaContainer

      beforeAll(() => {
        appContainer = getContainer()
      })

      beforeEach(async () => {
        await createAdminUser(dbConnection, adminHeaders, appContainer)
      })

      const createProduct = async () => {
        const { result } = await createProductsWorkflow(appContainer).run({
          input: {
            products: [{ title: "Retrieve Product", status: "published" }],
            created_by: "admin_user",
          },
        })
        return (result as { id: string }[])[0].id
      }

      it("lists products with default fields", async () => {
        const id = await createProduct()
        const res = await api.get("/admin/products?limit=50", adminHeaders)
        expect(res.status).toEqual(200)
        expect(
          (res.data.products as { id: string }[]).some((p) => p.id === id),
        ).toBe(true)
      })

      it("retrieves a product with default fields", async () => {
        const id = await createProduct()
        const res = await api.get(`/admin/products/${id}`, adminHeaders)
        expect(res.status).toEqual(200)
        expect(res.data.product.id).toEqual(id)
        expect(res.data.product.title).toEqual("Retrieve Product")
      })
    })
  },
})
