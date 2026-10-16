import { readFileSync } from "node:fs"
import { join } from "node:path"

import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import {
  createProductCategoriesWorkflow,
  updateProductCategoriesWorkflow,
} from "@medusajs/medusa/core-flows"

type AztradeChild = { name: string; handle: string }
type AztradeParent = { name: string; handle: string; children: AztradeChild[] }

type ExistingCategory = {
  id: string
  name: string
  handle: string
  parent_category_id?: string | null
}

const loadTree = (): AztradeParent[] => {
  const candidates = [
    join(__dirname, "aztrade-categories.json"),
    join(process.cwd(), "src/scripts/aztrade-categories.json"),
    join(process.cwd(), "apps/api/src/scripts/aztrade-categories.json"),
  ]
  for (const path of candidates) {
    try {
      return JSON.parse(readFileSync(path, "utf8")) as AztradeParent[]
    } catch {
      continue
    }
  }
  throw new Error(
    "aztrade-categories.json was not found next to ensure-aztrade-categories.ts"
  )
}

/**
 * Idempotent AZTrade catalog tree. Safe to re-run: categories are matched by
 * handle, names and parents are corrected, and nothing is deleted.
 *
 *   cd apps/api && npx medusa exec ./src/scripts/ensure-aztrade-categories.ts
 */
export default async function ensureAztradeCategories({
  container,
}: ExecArgs): Promise<void> {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const productModule = container.resolve(Modules.PRODUCT)
  const tree = loadTree()

  const existing = (await productModule.listProductCategories(
    {},
    { select: ["id", "name", "handle", "parent_category_id"], take: 1000 }
  )) as ExistingCategory[]
  const byHandle = new Map(existing.map((category) => [category.handle, category]))

  let created = 0
  let updated = 0

  const ensure = async (
    node: { name: string; handle: string },
    parentId: string | null,
    rank: number
  ) => {
    const current = byHandle.get(node.handle)
    if (!current) {
      const { result } = await createProductCategoriesWorkflow(container).run({
        input: {
          product_categories: [
            {
              name: node.name,
              handle: node.handle,
              is_active: true,
              is_internal: false,
              parent_category_id: parentId,
              rank,
            },
          ],
        },
      })
      const category = result[0] as ExistingCategory
      byHandle.set(category.handle, category)
      created += 1
      logger.info(`Created category ${category.handle}`)
      return category.id
    }

    const currentParent = current.parent_category_id ?? null
    if (
      current.name !== node.name ||
      currentParent !== parentId ||
      current.handle !== node.handle
    ) {
      await updateProductCategoriesWorkflow(container).run({
        input: {
          selector: { id: current.id },
          update: {
            name: node.name,
            handle: node.handle,
            parent_category_id: parentId,
            is_active: true,
            rank,
          },
        },
      })
      current.name = node.name
      current.parent_category_id = parentId
      updated += 1
      logger.info(`Updated category ${node.handle}`)
    }
    return current.id
  }

  for (const [parentRank, parent] of tree.entries()) {
    const parentId = await ensure(parent, null, parentRank)
    for (const [childRank, child] of parent.children.entries()) {
      await ensure(child, parentId, childRank)
    }
  }

  logger.info(
    `AZTrade categories ready (${tree.length} parents, created ${created}, updated ${updated})`
  )
}
