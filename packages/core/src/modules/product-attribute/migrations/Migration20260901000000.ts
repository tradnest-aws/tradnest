import { Migration } from "@medusajs/framework/mikro-orm/migrations"

/**
 * Re-apply product_id on product_attribute for databases that ran the
 * base table migration but never recorded Migration20260601000001.
 */
export class Migration20260901000000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`
      ALTER TABLE "product_attribute"
        ADD COLUMN IF NOT EXISTS "product_id" text NULL;
    `)
    this.addSql(`
      CREATE INDEX IF NOT EXISTS "IDX_product_attribute_product_id"
        ON "product_attribute" ("product_id")
        WHERE "deleted_at" IS NULL AND "product_id" IS NOT NULL;
    `)
  }

  override async down(): Promise<void> {
    this.addSql(`DROP INDEX IF EXISTS "IDX_product_attribute_product_id";`)
    this.addSql(
      `ALTER TABLE "product_attribute" DROP COLUMN IF EXISTS "product_id";`,
    )
  }
}
