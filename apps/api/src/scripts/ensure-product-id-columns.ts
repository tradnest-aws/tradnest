import { createRequire } from "module"
import { join } from "node:path"
import { ExecArgs } from "@medusajs/framework/types"

type QueryResult = { rows: Array<Record<string, string>> }

type Queryable = {
  query: (sql: string, params?: unknown[]) => Promise<QueryResult>
}

type PgClient = Queryable & {
  connect: () => Promise<void>
  end: () => Promise<void>
}

type PgClientConstructor = new (opts: {
  connectionString: string
  ssl?: { rejectUnauthorized: boolean }
}) => PgClient

function loadPgClient(): PgClientConstructor {
  const candidates = [
    join(process.cwd(), "package.json"),
    join(process.cwd(), "..", "..", "package.json"),
  ]
  for (const from of candidates) {
    try {
      const require = createRequire(from)
      const pg = require("pg") as {
        Client?: PgClientConstructor
        default?: { Client: PgClientConstructor }
      }
      const Client = pg.Client ?? pg.default?.Client
      if (Client) {
        return Client
      }
    } catch {
      // try the next resolution root
    }
  }
  throw new Error(
    "ensure-product-id-columns: package 'pg' not found (deploy uses scripts/ensure-product-id-columns.sql via psql)",
  )
}

const KNOWN_TABLES = [
  "product_option",
  "product_attribute",
  "offer",
  "product_change",
  "product_change_action",
  "quote_request",
  "product_variant",
  "product_image",
] as const

function quoteIdent(name: string): string {
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) {
    throw new Error(`refusing to alter unexpected table name ${name}`)
  }
  return `"${name}"`
}

async function applyProductIdColumns(db: Queryable): Promise<void> {
  const { rows: tables } = await db.query(
    `SELECT tablename
     FROM pg_tables
     WHERE schemaname = 'public'
       AND tablename <> 'product'
       AND (
         tablename = ANY($1::text[])
         OR tablename LIKE '%product_option%'
         OR tablename LIKE '%option%product%'
       )
     ORDER BY tablename`,
    [KNOWN_TABLES],
  )

  if (!tables.length) {
    throw new Error(
      "ensure-product-id-columns: no candidate tables found — is DATABASE_URL the Medusa database?",
    )
  }

  for (const row of tables) {
    const table = row.tablename
    const ident = quoteIdent(table)
    const { rows: cols } = await db.query(
      `SELECT column_name
       FROM information_schema.columns
       WHERE table_schema = 'public'
         AND table_name = $1
         AND column_name = 'product_id'`,
      [table],
    )
    if (!cols.length) {
      await db.query(`ALTER TABLE ${ident} ADD COLUMN "product_id" text`)
      console.log(`ensure-product-id-columns: added ${table}.product_id`)
    } else {
      console.log(`ensure-product-id-columns: ok ${table}.product_id`)
    }

    const { rows: deletedAt } = await db.query(
      `SELECT 1
       FROM information_schema.columns
       WHERE table_schema = 'public'
         AND table_name = $1
         AND column_name = 'deleted_at'`,
      [table],
    )
    if (deletedAt.length) {
      await db.query(
        `CREATE INDEX IF NOT EXISTS ${quoteIdent(`IDX_${table}_product_id`)}
         ON ${ident} ("product_id")
         WHERE deleted_at IS NULL`,
      )
    }
  }

  const { rows: offerCols } = await db.query(
    `SELECT column_name
     FROM information_schema.columns
     WHERE table_schema = 'public'
       AND table_name = 'offer'
       AND column_name IN ('product_id', 'variant_id')`,
  )
  const offerHas = new Set(offerCols.map((c) => c.column_name))
  if (offerHas.has("product_id") && offerHas.has("variant_id")) {
    await db.query(`
      UPDATE offer AS o
      SET product_id = pv.product_id
      FROM product_variant AS pv
      WHERE o.variant_id = pv.id
        AND pv.product_id IS NOT NULL
        AND (o.product_id IS NULL OR o.product_id = '')
    `)
    console.log("ensure-product-id-columns: backfilled offer.product_id from variant")
  }

  const { rows: optionJoin } = await db.query(`
    SELECT
      to_regclass('public.product_option') AS product_option,
      to_regclass('public.product_option_value') AS product_option_value,
      to_regclass('public.product_variant_option') AS product_variant_option,
      to_regclass('public.product_variant') AS product_variant
  `)
  const join = optionJoin[0] ?? {}
  if (
    join.product_option &&
    join.product_option_value &&
    join.product_variant_option &&
    join.product_variant
  ) {
    const { rows: pvoCols } = await db.query(
      `SELECT column_name
       FROM information_schema.columns
       WHERE table_schema = 'public'
         AND table_name = 'product_variant_option'
         AND column_name = 'option_value_id'`,
    )
    if (pvoCols.length) {
      await db.query(`
        UPDATE product_option AS po
        SET product_id = src.product_id
        FROM (
          SELECT pov.option_id AS option_id, MIN(pv.product_id) AS product_id
          FROM product_option_value AS pov
          INNER JOIN product_variant_option AS pvo
            ON pvo.option_value_id = pov.id
          INNER JOIN product_variant AS pv
            ON pv.id = pvo.variant_id
          WHERE pv.product_id IS NOT NULL
          GROUP BY pov.option_id
        ) AS src
        WHERE po.id = src.option_id
          AND (po.product_id IS NULL OR po.product_id = '')
      `)
      console.log(
        "ensure-product-id-columns: backfilled product_option.product_id from variants",
      )
    }
  }

  const required = ["product_option", "product_attribute", "offer"] as const
  const missing: string[] = []
  for (const table of required) {
    const { rows: exists } = await db.query(
      `SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = $1`,
      [table],
    )
    if (!exists.length) {
      console.log(`ensure-product-id-columns: skip missing table ${table}`)
      continue
    }
    const { rows: cols } = await db.query(
      `SELECT 1
       FROM information_schema.columns
       WHERE table_schema = 'public'
         AND table_name = $1
         AND column_name = 'product_id'`,
      [table],
    )
    if (!cols.length) {
      missing.push(`${table}.product_id`)
    }
  }
  if (missing.length) {
    throw new Error(
      `ensure-product-id-columns: still missing ${missing.join(", ")}`,
    )
  }
}

async function runWithDatabaseUrl(): Promise<void> {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set")
  }
  const Client = loadPgClient()
  const ssl =
    /amazonaws\.com/i.test(connectionString) ||
    /sslmode=(require|verify-full|verify-ca)/i.test(connectionString)
      ? { rejectUnauthorized: false }
      : undefined
  const client = new Client({ connectionString, ssl })
  await client.connect()
  try {
    await applyProductIdColumns(client)
  } finally {
    await client.end()
  }
}

export default async function ensureProductIdColumns(
  _args: ExecArgs,
): Promise<void> {
  await runWithDatabaseUrl()
}

const meta = import.meta as ImportMeta & { main?: boolean; path?: string }
const bunMain = (globalThis as { Bun?: { main?: string } }).Bun?.main
const invokedDirectly =
  meta.main === true ||
  (typeof bunMain === "string" && bunMain === meta.path) ||
  (process.argv[1] ?? "").endsWith("ensure-product-id-columns.ts")
if (invokedDirectly) {
  runWithDatabaseUrl().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`ensure-product-id-columns: ${message}`)
    process.exit(1)
  })
}
