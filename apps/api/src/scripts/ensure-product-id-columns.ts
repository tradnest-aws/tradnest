import { ExecArgs } from "@medusajs/framework/types"

type PgConnection = {
  raw: (sql: string) => Promise<unknown>
}

const STATEMENTS = [
  `ALTER TABLE "product_attribute" ADD COLUMN IF NOT EXISTS "product_id" text NULL`,
  `CREATE INDEX IF NOT EXISTS "IDX_product_attribute_product_id" ON "product_attribute" ("product_id") WHERE "deleted_at" IS NULL AND "product_id" IS NOT NULL`,
  `ALTER TABLE "offer" ADD COLUMN IF NOT EXISTS "product_id" text NOT NULL DEFAULT ''`,
  `CREATE INDEX IF NOT EXISTS "IDX_offer_product_id" ON "offer" ("product_id") WHERE deleted_at IS NULL`,
]

export default async function ensureProductIdColumns({
  container,
}: ExecArgs): Promise<void> {
  const knex = container.resolve("__pg_connection__") as PgConnection

  for (const sql of STATEMENTS) {
    try {
      await knex.raw(sql)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error)
      console.warn(`ensure-product-id-columns: ${message}`)
    }
  }

  console.log("ensure-product-id-columns: applied product_attribute.product_id and offer.product_id")
}
