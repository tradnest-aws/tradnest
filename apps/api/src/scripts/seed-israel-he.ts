import { ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
  toHandle,
} from "@medusajs/framework/utils"
import {
  ProductStatus,
  type CreateOfferDTO,
  type CreateProductDTO,
} from "@mercurjs/types"
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
  createProductCategoriesWorkflow,
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
import {
  ISRAEL_COUNTRY,
  ISRAEL_CURRENCY,
  ISRAEL_PRIMARY_SELLER_EMAIL,
  israelCategories,
  israelProducts,
  israelSellers,
} from "./seed-israel-catalog"

const SELLER_PASSWORD = "supersecret"

const updateStoreCurrencies = createWorkflow(
  "update-store-currencies-israel",
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

export default async function seedIsraelHebrew({
  container,
}: ExecArgs): Promise<void> {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const link = container.resolve(ContainerRegistrationKeys.LINK)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL)
  const storeModuleService = container.resolve(Modules.STORE)
  const regionModuleService = container.resolve(Modules.REGION)
  const taxModuleService = container.resolve(Modules.TAX)
  const productModule = container.resolve(Modules.PRODUCT)
  const authModuleService = container.resolve(Modules.AUTH)

  logger.info("Seeding Israel (ILS) store, Hebrew sellers and products...")

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
      supported_currencies: [{ currency_code: ISRAEL_CURRENCY, is_default: true }],
    },
  })

  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: {
        name: "Tradnest ישראל",
        default_sales_channel_id: defaultSalesChannel[0].id,
      },
    },
  })

  const existingRegions = await regionModuleService.listRegions(
    {},
    { relations: ["countries"] }
  )
  let region = existingRegions.find((item) =>
    item.countries?.some((country) => country.iso_2 === ISRAEL_COUNTRY)
  )
  if (!region) {
    const assigned = new Set(
      existingRegions.flatMap((item) =>
        (item.countries ?? []).map((country) => country.iso_2)
      )
    )
    if (assigned.has(ISRAEL_COUNTRY)) {
      throw new Error("Israel is assigned to a region that failed to resolve")
    }
    const { result } = await createRegionsWorkflow(container).run({
      input: {
        regions: [
          {
            name: "ישראל",
            currency_code: ISRAEL_CURRENCY,
            countries: [ISRAEL_COUNTRY],
            payment_providers: ["pp_system_default"],
          },
        ],
      },
    })
    region = result[0]
  }
  if (!region) {
    throw new Error("Israel region is missing")
  }

  const existingTax = await taxModuleService.listTaxRegions({
    country_code: ISRAEL_COUNTRY,
  })
  if (!existingTax.length) {
    await createTaxRegionsWorkflow(container).run({
      input: [
        { country_code: ISRAEL_COUNTRY, provider_id: "tp_system" },
      ],
    })
  }

  const existingCats = await productModule.listProductCategories(
    {},
    { take: 500 }
  )
  const catByName = new Map(existingCats.map((category) => [category.name, category]))
  const catByHandle = new Map(
    existingCats.map((category) => [category.handle, category])
  )
  const missing = israelCategories.filter((category) => {
    return !catByName.has(category.name) && !catByHandle.has(category.handle)
  })
  if (missing.length) {
    const { result } = await createProductCategoriesWorkflow(container).run({
      input: {
        product_categories: missing.map((category, rank) => ({
          name: category.name,
          handle: category.handle,
          is_active: true,
          rank,
        })),
      },
    })
    result.forEach((category) => {
      catByName.set(category.name, category)
      catByHandle.set(category.handle, category)
    })
  }
  const resolveCategory = (name: string) => {
    const meta = israelCategories.find((category) => category.name === name)
    return (
      catByName.get(name) ??
      (meta ? catByHandle.get(meta.handle) : undefined) ??
      catByHandle.get(name)
    )
  }

  const { data: existingPrimary } = await query.graph({
    entity: "seller",
    fields: ["id"],
    filters: { email: ISRAEL_PRIMARY_SELLER_EMAIL },
  })
  if (existingPrimary[0]) {
    logger.info("Hebrew demo sellers already exist, skipping catalog seed.")
    return
  }

  let sharedShippingProfileId: string
  const { data: existingProfiles } = await query.graph({
    entity: "shipping_profile",
    fields: ["id"],
    filters: { name: "Marketplace Shipping" },
  })
  if (existingProfiles[0]) {
    sharedShippingProfileId = existingProfiles[0].id as string
  } else {
    const {
      result: [createdProfile],
    } = await createShippingProfilesWorkflow(container).run({
      input: { data: [{ name: "Marketplace Shipping", type: "default" }] },
    })
    sharedShippingProfileId = createdProfile.id
  }

  type SeededSeller = {
    id: string
    memberId: string
    stockLocationId: string
    shippingProfileId: string
  }
  const sellers: SeededSeller[] = []

  const sellerLogo = (name: string) =>
    `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(name)}`
  const sellerBanner = (key: string) =>
    `https://picsum.photos/seed/${key}/1200/320`

  for (const [index, sellerConfig] of israelSellers.entries()) {
    logger.info(`Seeding seller "${sellerConfig.name}"...`)

    let authIdentityId: string
    const registerResponse = await authModuleService.register("emailpass", {
      body: { email: sellerConfig.email, password: SELLER_PASSWORD },
    })
    if (registerResponse.success && registerResponse.authIdentity) {
      authIdentityId = registerResponse.authIdentity.id
    } else {
      const [providerIdentity] = await authModuleService.listProviderIdentities({
        entity_id: sellerConfig.email,
        provider: "emailpass",
      })
      authIdentityId = providerIdentity.auth_identity_id!
    }

    const { result: seller } = await createSellerAccountWorkflow(container).run({
      input: {
        auth_identity_id: authIdentityId,
        member_email: sellerConfig.email,
        first_name: sellerConfig.first_name,
        last_name: sellerConfig.last_name,
        seller: {
          name: sellerConfig.name,
          email: sellerConfig.email,
          currency_code: ISRAEL_CURRENCY,
          description: sellerConfig.description,
          logo: sellerLogo(sellerConfig.name),
          banner: sellerBanner(toHandle(sellerConfig.email)),
        },
      },
    })

    await approveSellerWorkflow(container).run({
      input: { seller_id: seller.id },
    })

    const { data: members } = await query.graph({
      entity: "member",
      fields: ["id"],
      filters: { email: sellerConfig.email },
    })
    const memberId = members[0].id as string

    const { result: stockLocations } =
      await createSellerStockLocationsWorkflow(container).run({
        input: {
          seller_id: seller.id,
          locations: [
            {
              name: `מחסן ${sellerConfig.name}`,
              address: {
                city: sellerConfig.city,
                country_code: ISRAEL_COUNTRY.toUpperCase(),
                address_1: sellerConfig.address_1,
              },
            },
          ],
        },
      })
    const stockLocation = stockLocations[0]

    await link.create({
      [Modules.STOCK_LOCATION]: { stock_location_id: stockLocation.id },
      [Modules.FULFILLMENT]: { fulfillment_provider_id: "manual_manual" },
    })

    await linkSalesChannelsToStockLocationWorkflow(container).run({
      input: {
        id: stockLocation.id,
        add: [defaultSalesChannel[0].id],
      },
    })

    if (index === 0) {
      await updateStoresWorkflow(container).run({
        input: {
          selector: { id: store.id },
          update: { default_location_id: stockLocation.id },
        },
      })
    }

    await createLocationFulfillmentSetWorkflow(container).run({
      input: {
        location_id: stockLocation.id,
        fulfillment_set_data: {
          name: `משלוחים ${sellerConfig.name}`,
          type: "shipping",
        },
      },
    })

    const {
      data: [locationWithSet],
    } = await query.graph({
      entity: "stock_location",
      fields: ["id", "fulfillment_sets.id"],
      filters: { id: stockLocation.id },
    })
    const fulfillmentSetId = locationWithSet?.fulfillment_sets?.[0]?.id
    if (!fulfillmentSetId) {
      throw new Error(`No fulfillment set for ${sellerConfig.name}`)
    }

    const { result: serviceZones } = await createServiceZonesWorkflow(
      container
    ).run({
      input: {
        data: [
          {
            fulfillment_set_id: fulfillmentSetId,
            name: "ישראל",
            geo_zones: [
              { country_code: ISRAEL_COUNTRY, type: "country" as const },
            ],
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
            shipping_profile_id: sharedShippingProfileId,
            type: {
              label: "רגיל",
              description: "2–4 ימי עסקים בכל הארץ",
              code: "standard",
            },
            prices: [
              { currency_code: ISRAEL_CURRENCY, amount: 35 },
              { region_id: region.id, amount: 35 },
            ],
            rules: [
              { attribute: "enabled_in_store", value: "true", operator: "eq" },
              { attribute: "is_return", value: "false", operator: "eq" },
            ],
          },
          {
            name: "משלוח מהיר",
            price_type: "flat",
            provider_id: "manual_manual",
            service_zone_id: serviceZones[0].id,
            shipping_profile_id: sharedShippingProfileId,
            type: {
              label: "מהיר",
              description: "עד 24 שעות במרכז",
              code: "express",
            },
            prices: [
              { currency_code: ISRAEL_CURRENCY, amount: 79 },
              { region_id: region.id, amount: 79 },
            ],
            rules: [
              { attribute: "enabled_in_store", value: "true", operator: "eq" },
              { attribute: "is_return", value: "false", operator: "eq" },
            ],
          },
        ],
      },
    })

    sellers.push({
      id: seller.id,
      memberId,
      stockLocationId: stockLocation.id,
      shippingProfileId: sharedShippingProfileId,
    })
  }

  const products: CreateProductDTO[] = israelProducts.map((item) => {
    const sku = item.handle.toUpperCase().replace(/-/g, "")
    const image = {
      url: `https://picsum.photos/seed/${item.handle}/800/800`,
    }
    const category = resolveCategory(item.category)
    if (!category) {
      throw new Error(`Missing category ${item.category}`)
    }
    return {
      title: item.title,
      category_ids: [category.id],
      description: item.description,
      handle: item.handle,
      status: ProductStatus.PUBLISHED,
      thumbnail: image.url,
      images: [image],
      variants: [
        {
          title: "יחידה",
          sku: `${sku}-U`,
        },
      ],
    }
  })

  await createProductsWorkflow(container).run({
    input: {
      created_by: sellers[0].memberId,
      products,
    },
  })

  const priceByHandle = new Map(
    israelProducts.map((item) => [item.handle, item.priceIls])
  )
  const { data: seededProducts } = await query.graph({
    entity: "product",
    fields: ["id", "handle", "variants.id", "variants.sku"],
    filters: {
      handle: israelProducts.map((item) => item.handle),
    },
  })

  const offers: CreateOfferDTO[] = []
  for (const [productIndex, product] of seededProducts.entries()) {
    const basePrice = priceByHandle.get(product.handle) ?? 50
    const seller = sellers[productIndex % sellers.length]
    for (const variant of product.variants as { id: string; sku: string | null }[]) {
      const sku = `HE-${seller.id.slice(-4)}-${variant.sku}`
      offers.push({
        seller_id: seller.id,
        created_by: seller.memberId,
        sku,
        variant_id: variant.id,
        shipping_profile_id: seller.shippingProfileId,
        inventory_items: [
          {
            sku,
            stock_levels: [
              {
                location_id: seller.stockLocationId,
                stocked_quantity: 5000,
              },
            ],
          },
        ],
        prices: [{ amount: basePrice, currency_code: ISRAEL_CURRENCY }],
      })
    }
  }

  await createOffersWorkflow(container).run({ input: { offers } })
  logger.info(
    `Seeded ${sellers.length} Hebrew sellers, ${products.length} products, ${offers.length} offers. Region Israel / ILS only.`
  )
}
