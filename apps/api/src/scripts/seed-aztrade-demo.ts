import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { ProductStatus, type CreateOfferDTO, type CreateProductDTO } from "@mercurjs/types"
import {
  approveSellerWorkflow,
  createOffersWorkflow,
  createProductsWorkflow,
  createSellerAccountWorkflow,
  createSellerShippingOptionsWorkflow,
  createSellerStockLocationsWorkflow,
} from "@mercurjs/core/workflows"
import {
  createLocationFulfillmentSetWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createServiceZonesWorkflow,
  createShippingProfilesWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  updateStoresStep,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows"
import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"

const COUNTRY = "il"
const CURRENCY = "ils"
const SELLER_EMAIL = "an.building@aztrade.demo"
const SELLER_PASSWORD = "supersecret"
const SELLER_NAME = "א.נ חומרי בנין"
const SELLER_HANDLE = "a-n-building-materials"

type DemoProduct = {
  title: string
  handle: string
  description: string
  categoryHandle: string
  priceIls: number | null
  stock: number
}

const PRODUCTS: DemoProduct[] = [
  {
    title: "ברז מטבח נירוסטה",
    handle: "kitchen-faucet-stainless",
    description: "ברז מטבח נירוסטה לקבלנים, ידית אחת, חיבור 1/2.",
    categoryHandle: "faucets",
    priceIls: 189,
    stock: 40,
  },
  {
    title: "מחבר PVC 50 מ״מ",
    handle: "pvc-coupling-50",
    description: "מחבר צנרת PVC בקוטר 50 מ״מ, מתאים לקווי ניקוז.",
    categoryHandle: "piping-connectors-and-accessories",
    priceIls: 24,
    stock: 200,
  },
  {
    title: "שק גבס 25 ק״ג",
    handle: "gypsum-bag-25",
    description: "גבס לבנייה ושיפוצים, שק 25 ק״ג.",
    categoryHandle: "construction-materials-and-plaster",
    priceIls: 32,
    stock: 80,
  },
  {
    title: "נורת LED 12W",
    handle: "led-bulb-12w",
    description: "נורת LED 12W בסיס E27, אור לבן.",
    categoryHandle: "bulbs-leds-and-led-strips",
    priceIls: 18,
    stock: 150,
  },
  {
    title: "מפסק פחת 40A",
    handle: "rcd-breaker-40a",
    description: "מפסק פחת 40 אמפר ללוח חשמל.",
    categoryHandle: "electrical-panels-protection-and-installation-accessories",
    priceIls: 145,
    stock: 25,
  },
  {
    title: "כבל חשמל 3×2.5",
    handle: "power-cable-3x25",
    description: "כבל חשמל 3×2.5 מ״מ. המחיר לפי בקשה.",
    categoryHandle: "cables-conductors-and-data-transitions",
    priceIls: null,
    stock: 60,
  },
]

const updateStoreCurrencies = createWorkflow(
  "update-store-currencies-aztrade-demo",
  (input: {
    supported_currencies: { currency_code: string; is_default?: boolean }[]
    store_id: string
  }) => {
    const normalizedInput = transform({ input }, (data) => ({
      selector: { id: data.input.store_id },
      update: {
        supported_currencies: data.input.supported_currencies.map((currency) => ({
          currency_code: currency.currency_code,
          is_default: currency.is_default ?? false,
        })),
      },
    }))
    const stores = updateStoresStep(normalizedInput)
    return new WorkflowResponse(stores)
  }
)

export default async function seedAztradeDemo({ container }: ExecArgs): Promise<void> {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const link = container.resolve(ContainerRegistrationKeys.LINK)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL)
  const storeModuleService = container.resolve(Modules.STORE)
  const regionModuleService = container.resolve(Modules.REGION)
  const taxModuleService = container.resolve(Modules.TAX)
  const authModuleService = container.resolve(Modules.AUTH)

  const [store] = await storeModuleService.listStores()
  let defaultSalesChannel = await salesChannelModuleService.listSalesChannels({
    name: "Default Sales Channel",
  })
  if (!defaultSalesChannel.length) {
    const { result } = await createSalesChannelsWorkflow(container).run({
      input: { salesChannelsData: [{ name: "Default Sales Channel" }] },
    })
    defaultSalesChannel = result
  }

  await updateStoreCurrencies(container).run({
    input: {
      store_id: store.id,
      supported_currencies: [{ currency_code: CURRENCY, is_default: true }],
    },
  })

  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: {
        name: "AZTrade",
        default_sales_channel_id: defaultSalesChannel[0].id,
      },
    },
  })

  const existingRegions = await regionModuleService.listRegions(
    {},
    { relations: ["countries"] }
  )
  let region = existingRegions.find((item) =>
    item.countries?.some((country) => country.iso_2 === COUNTRY)
  )
  if (!region) {
    const { result } = await createRegionsWorkflow(container).run({
      input: {
        regions: [
          {
            name: "ישראל",
            currency_code: CURRENCY,
            countries: [COUNTRY],
            payment_providers: ["pp_system_default"],
          },
        ],
      },
    })
    region = result[0]
    logger.info("Created Israel region (ils / il)")
  } else {
    logger.info(`Israel region already exists (${region.id})`)
  }
  if (!region) {
    throw new Error("Israel region is missing")
  }

  const existingTax = await taxModuleService.listTaxRegions({
    country_code: COUNTRY,
  })
  if (!existingTax.length) {
    await createTaxRegionsWorkflow(container).run({
      input: [{ country_code: COUNTRY, provider_id: "tp_system" }],
    })
  }

  const { data: categories } = await query.graph({
    entity: "product_category",
    fields: ["id", "handle", "name"],
    pagination: { take: 1000, skip: 0 },
  })
  const categoryByHandle = new Map(
    (categories as { id: string; handle: string }[])
      .filter((category) => category.handle)
      .map((category) => [category.handle, category])
  )
  for (const item of PRODUCTS) {
    if (!categoryByHandle.has(item.categoryHandle)) {
      throw new Error(
        `Missing category ${item.categoryHandle}. Run bun run categories:aztrade first.`
      )
    }
  }

  let shippingProfileId: string
  const { data: existingProfiles } = await query.graph({
    entity: "shipping_profile",
    fields: ["id"],
    filters: { name: "Marketplace Shipping" },
  })
  if (existingProfiles[0]) {
    shippingProfileId = existingProfiles[0].id as string
  } else {
    const {
      result: [createdProfile],
    } = await createShippingProfilesWorkflow(container).run({
      input: { data: [{ name: "Marketplace Shipping", type: "default" }] },
    })
    shippingProfileId = createdProfile.id
  }

  const { data: existingSellerRows } = await query.graph({
    entity: "seller",
    fields: ["id", "handle", "email"],
    filters: { email: SELLER_EMAIL },
  })

  let sellerId: string
  let memberId: string
  let stockLocationId: string

  if (existingSellerRows[0]) {
    sellerId = existingSellerRows[0].id as string
    const { data: members } = await query.graph({
      entity: "member",
      fields: ["id"],
      filters: { email: SELLER_EMAIL },
    })
    const { data: locations } = await query.graph({
      entity: "stock_location",
      fields: ["id"],
      filters: { name: `מחסן ${SELLER_NAME}` },
    })
    if (!members[0] || !locations[0]) {
      throw new Error("Seller exists but member or stock location is missing")
    }
    memberId = members[0].id as string
    stockLocationId = locations[0].id as string
    logger.info(`Reusing seller ${SELLER_NAME} (${existingSellerRows[0].handle})`)
  } else {
    let authIdentityId: string
    const registerResponse = await authModuleService.register("emailpass", {
      body: { email: SELLER_EMAIL, password: SELLER_PASSWORD },
    })
    if (registerResponse.success && registerResponse.authIdentity) {
      authIdentityId = registerResponse.authIdentity.id
    } else {
      const [providerIdentity] = await authModuleService.listProviderIdentities({
        entity_id: SELLER_EMAIL,
        provider: "emailpass",
      })
      authIdentityId = providerIdentity.auth_identity_id!
    }

    const { result: seller } = await createSellerAccountWorkflow(container).run({
      input: {
        auth_identity_id: authIdentityId,
        member_email: SELLER_EMAIL,
        first_name: "א.נ",
        last_name: "חומרי בנין",
        seller: {
          name: SELLER_NAME,
          handle: SELLER_HANDLE,
          email: SELLER_EMAIL,
          currency_code: CURRENCY,
          description:
            "ספק חומרי בניין, אינסטלציה וחשמל לקבלנים ולחנויות. משלוחים לכל הארץ.",
          website_url: "https://a2zedconnect.com",
          logo: "https://placehold.co/160x160/4f46e5/ffffff?text=AN",
        },
        address: {
          address_1: "הרצל 12",
          city: "חולון",
          country_code: COUNTRY,
          postal_code: "5830101",
          phone: "03-5551234",
        },
      },
    })

    await approveSellerWorkflow(container).run({
      input: { seller_id: seller.id },
    })

    const { data: members } = await query.graph({
      entity: "member",
      fields: ["id"],
      filters: { email: SELLER_EMAIL },
    })
    memberId = members[0].id as string
    sellerId = seller.id

    const { result: stockLocations } = await createSellerStockLocationsWorkflow(
      container
    ).run({
      input: {
        seller_id: seller.id,
        locations: [
          {
            name: `מחסן ${SELLER_NAME}`,
            address: {
              city: "חולון",
              country_code: COUNTRY.toUpperCase(),
              address_1: "הרצל 12",
            },
          },
        ],
      },
    })
    stockLocationId = stockLocations[0].id

    await link.create({
      [Modules.STOCK_LOCATION]: { stock_location_id: stockLocationId },
      [Modules.FULFILLMENT]: { fulfillment_provider_id: "manual_manual" },
    })

    await linkSalesChannelsToStockLocationWorkflow(container).run({
      input: {
        id: stockLocationId,
        add: [defaultSalesChannel[0].id],
      },
    })

    await updateStoresWorkflow(container).run({
      input: {
        selector: { id: store.id },
        update: { default_location_id: stockLocationId },
      },
    })

    await createLocationFulfillmentSetWorkflow(container).run({
      input: {
        location_id: stockLocationId,
        fulfillment_set_data: {
          name: `משלוחים ${SELLER_NAME}`,
          type: "shipping",
        },
      },
    })

    const {
      data: [locationWithSet],
    } = await query.graph({
      entity: "stock_location",
      fields: ["id", "fulfillment_sets.id"],
      filters: { id: stockLocationId },
    })
    const fulfillmentSetId = locationWithSet?.fulfillment_sets?.[0]?.id
    if (!fulfillmentSetId) {
      throw new Error("No fulfillment set for the demo seller")
    }

    const { result: serviceZones } = await createServiceZonesWorkflow(container).run({
      input: {
        data: [
          {
            fulfillment_set_id: fulfillmentSetId,
            name: "ישראל",
            geo_zones: [{ country_code: COUNTRY, type: "country" as const }],
          },
        ],
      },
    })

    await createSellerShippingOptionsWorkflow(container).run({
      input: {
        seller_id: seller.id,
        shipping_options: [
          {
            name: "משלוח רגיל",
            price_type: "flat",
            provider_id: "manual_manual",
            service_zone_id: serviceZones[0].id,
            shipping_profile_id: shippingProfileId,
            type: {
              label: "רגיל",
              description: "2–4 ימי עסקים בכל הארץ",
              code: "standard",
            },
            prices: [
              { currency_code: CURRENCY, amount: 35 },
              { region_id: region.id, amount: 35 },
            ],
            rules: [
              { attribute: "enabled_in_store", value: "true", operator: "eq" },
              { attribute: "is_return", value: "false", operator: "eq" },
            ],
          },
        ],
      },
    })

    logger.info(`Created approved seller ${SELLER_NAME} handle=${seller.handle}`)
  }

  const { data: existingCatalog } = await query.graph({
    entity: "product",
    fields: ["id", "handle", "variants.id", "variants.sku"],
    filters: { handle: PRODUCTS.map((item) => item.handle) },
  })
  const existingByHandle = new Map(
    (existingCatalog as { handle: string; id: string; variants: { id: string; sku: string | null }[] }[]).map(
      (item) => [item.handle, item]
    )
  )
  const missing = PRODUCTS.filter((item) => !existingByHandle.has(item.handle))

  if (missing.length) {
    const products: CreateProductDTO[] = missing.map((item) => {
      const category = categoryByHandle.get(item.categoryHandle)
      const image = {
        url: `https://placehold.co/800x800/4f46e5/ffffff?text=${encodeURIComponent(item.handle)}`,
      }
      return {
        title: item.title,
        category_ids: [category!.id],
        description: item.description,
        handle: item.handle,
        status: ProductStatus.PUBLISHED,
        thumbnail: image.url,
        images: [image],
        variants: [
          {
            title: "יחידה",
            sku: `${item.handle.toUpperCase().replace(/-/g, "")}-U`,
          },
        ],
      }
    })

    await createProductsWorkflow(container).run({
      input: { created_by: memberId, products },
    })
    logger.info(`Created ${products.length} products`)
  }

  const { data: catalog } = await query.graph({
    entity: "product",
    fields: ["id", "handle", "variants.id", "variants.sku"],
    filters: { handle: PRODUCTS.map((item) => item.handle) },
  })

  const { data: existingOffers } = await query.graph({
    entity: "offer",
    fields: ["id", "variant_id", "sku"],
    filters: { seller_id: sellerId },
  })
  const offeredVariants = new Set(
    (existingOffers as { variant_id: string }[]).map((offer) => offer.variant_id)
  )

  const priceByHandle = new Map(PRODUCTS.map((item) => [item.handle, item]))
  const offers: CreateOfferDTO[] = []
  for (const product of catalog as {
    handle: string
    variants: { id: string; sku: string | null }[]
  }[]) {
    const meta = priceByHandle.get(product.handle)
    if (!meta) continue
    for (const variant of product.variants) {
      if (offeredVariants.has(variant.id)) continue
      const sku = `AZ-${variant.sku}`
      offers.push({
        seller_id: sellerId,
        created_by: memberId,
        sku,
        variant_id: variant.id,
        shipping_profile_id: shippingProfileId,
        inventory_items: [
          {
            sku,
            stock_levels: [
              { location_id: stockLocationId, stocked_quantity: meta.stock },
            ],
          },
        ],
        prices:
          meta.priceIls == null
            ? []
            : [{ amount: meta.priceIls, currency_code: CURRENCY }],
      })
    }
  }

  if (offers.length) {
    await createOffersWorkflow(container).run({ input: { offers } })
  }

  const { data: sellerRow } = await query.graph({
    entity: "seller",
    fields: ["id", "handle", "name", "status"],
    filters: { id: sellerId },
  })

  const summary = {
    seller: sellerRow[0],
    path: `/sellers/${(sellerRow[0]?.handle as string) || SELLER_HANDLE}`,
    products: PRODUCTS.map((item) => ({
      title: item.title,
      handle: item.handle,
      category: item.categoryHandle,
      priceIls: item.priceIls,
      stock: item.stock,
    })),
    offersCreated: offers.length,
  }
  console.log(`AZTRADE_DEMO_SEED=${JSON.stringify(summary)}`)
  logger.info(`Demo seed ready at ${summary.path}`)
}
