import { PolicyResource } from "../../utils/policy-resources"
import { PolicyOperation } from "@medusajs/framework/utils"
import {
  AuthenticatedMedusaRequest,
  MedusaNextFunction,
  MedusaResponse,
  MiddlewareRoute,
} from "@medusajs/framework/http"
import {
  validateAndTransformBody,
  validateAndTransformQuery,
} from "@medusajs/framework"
import { applyOfferedProductsFilter } from "../../utils"
import {
  ensureSellerOwnsProduct,
  getSellerAssignedProductIds,
  getSellerOwnedProductIds,
  sellerVisibleProductIds,
} from "./helpers"
import {
  vendorProductQueryConfig,
  vendorProductVariantQueryConfig,
} from "./query-config"
import {
  VendorAddProductVariant,
  VendorBatchProductAttributes,
  VendorCancelProductChange,
  VendorCreateProduct,
  VendorGetProductParams,
  VendorGetProductsParams,
  VendorGetProductVariantParams,
  VendorGetProductVariantsParams,
  VendorUpdateProduct,
  VendorUpdateProductVariant,
} from "./validators"
import { promiseAll } from "@medusajs/framework/utils"

const applySellerProductLinkFilter = async (
  req: AuthenticatedMedusaRequest,
  _res: MedusaResponse,
  next: MedusaNextFunction
) => {
  const sellerId = req.seller_context!.seller_id

  const [ownProductIds, assignedProductIds] = await promiseAll([
    getSellerOwnedProductIds(req.scope, sellerId),
    getSellerAssignedProductIds(req.scope, sellerId),
  ])

  req.filterableFields ??= {}
  const existingAnd = (req.filterableFields.$and as object[] | undefined) ?? []
  req.filterableFields.$and = [
    ...existingAnd,
    {
      id: sellerVisibleProductIds(ownProductIds, assignedProductIds),
    },
  ]

  return next()
}

const requireSellerOwnsProduct = async (
  req: AuthenticatedMedusaRequest,
  _res: MedusaResponse,
  next: MedusaNextFunction
) => {
  const productId = req.params.id
  if (!productId) {
    return next()
  }

  try {
    await ensureSellerOwnsProduct(req.scope, req.seller_context!.seller_id, [
      productId,
    ])
    return next()
  } catch (error) {
    return next(error)
  }
}

export const vendorProductsMiddlewares: MiddlewareRoute[] = [
  {
    method: ["GET"],
    matcher: "/vendor/products",
    middlewares: [
      validateAndTransformQuery(
        VendorGetProductsParams,
        vendorProductQueryConfig.list
      ),
      applySellerProductLinkFilter,
      applyOfferedProductsFilter,
    ],
    policies: [
      {
        resource: PolicyResource.product,
        operation: PolicyOperation.read,
      },
    ],
  },
  {
    method: ["POST"],
    matcher: "/vendor/products",
    middlewares: [
      validateAndTransformBody(VendorCreateProduct),
      validateAndTransformQuery(
        VendorGetProductParams,
        vendorProductQueryConfig.retrieve
      ),
    ],
    policies: [
      {
        resource: PolicyResource.product,
        operation: PolicyOperation.create,
      },
    ],
  },

  {
    method: ["GET"],
    matcher: "/vendor/products/:id",
    middlewares: [
      requireSellerOwnsProduct,
      validateAndTransformQuery(
        VendorGetProductParams,
        vendorProductQueryConfig.retrieve
      ),
    ],
    policies: [
      {
        resource: PolicyResource.product,
        operation: PolicyOperation.read,
      },
    ],
  },
  {
    method: ["POST"],
    matcher: "/vendor/products/:id",
    middlewares: [
      requireSellerOwnsProduct,
      validateAndTransformBody(VendorUpdateProduct),
      validateAndTransformQuery(
        VendorGetProductParams,
        vendorProductQueryConfig.retrieve
      ),
    ],
    policies: [
      {
        resource: PolicyResource.product,
        operation: PolicyOperation.update,
      },
    ],
  },
  {
    method: ["DELETE"],
    matcher: "/vendor/products/:id",
    middlewares: [requireSellerOwnsProduct],
    policies: [
      {
        resource: PolicyResource.product,
        operation: PolicyOperation.delete,
      },
    ],
  },

  {
    method: ["POST"],
    matcher: "/vendor/products/:id/cancel",
    middlewares: [
      requireSellerOwnsProduct,
      validateAndTransformBody(VendorCancelProductChange),
    ],
    policies: [
      {
        resource: PolicyResource.product,
        operation: PolicyOperation.update,
      },
    ],
  },

  {
    method: ["GET"],
    matcher: "/vendor/products/:id/variants",
    middlewares: [
      requireSellerOwnsProduct,
      validateAndTransformQuery(
        VendorGetProductVariantsParams,
        vendorProductVariantQueryConfig.list
      ),
    ],
    policies: [
      {
        resource: PolicyResource.product_variant,
        operation: PolicyOperation.read,
      },
    ],
  },
  {
    method: ["POST"],
    matcher: "/vendor/products/:id/variants",
    middlewares: [
      requireSellerOwnsProduct,
      validateAndTransformBody(VendorAddProductVariant),
      validateAndTransformQuery(
        VendorGetProductParams,
        vendorProductQueryConfig.retrieve
      ),
    ],
    policies: [
      {
        resource: PolicyResource.product_variant,
        operation: PolicyOperation.update,
      },
    ],
  },

  {
    method: ["GET"],
    matcher: "/vendor/products/:id/variants/:variant_id",
    middlewares: [
      requireSellerOwnsProduct,
      validateAndTransformQuery(
        VendorGetProductVariantParams,
        vendorProductVariantQueryConfig.retrieve
      ),
    ],
    policies: [
      {
        resource: PolicyResource.product_variant,
        operation: PolicyOperation.read,
      },
    ],
  },
  {
    method: ["POST"],
    matcher: "/vendor/products/:id/variants/:variant_id",
    middlewares: [
      requireSellerOwnsProduct,
      validateAndTransformBody(VendorUpdateProductVariant),
      validateAndTransformQuery(
        VendorGetProductParams,
        vendorProductQueryConfig.retrieve
      ),
    ],
    policies: [
      {
        resource: PolicyResource.product_variant,
        operation: PolicyOperation.update,
      },
    ],
  },
  {
    method: ["DELETE"],
    matcher: "/vendor/products/:id/variants/:variant_id",
    middlewares: [requireSellerOwnsProduct],
    policies: [
      {
        resource: PolicyResource.product_variant,
        operation: PolicyOperation.delete,
      },
    ],
  },

  {
    method: ["POST"],
    matcher: "/vendor/products/:id/attributes/batch",
    middlewares: [
      requireSellerOwnsProduct,
      validateAndTransformBody(VendorBatchProductAttributes),
      validateAndTransformQuery(
        VendorGetProductParams,
        vendorProductQueryConfig.retrieve
      ),
    ],
    policies: [
      {
        resource: PolicyResource.product,
        operation: PolicyOperation.update,
      },
    ],
  },
  {
    method: ["GET"],
    matcher: "/vendor/products/:id/preview",
    middlewares: [requireSellerOwnsProduct],
    policies: [
      {
        resource: PolicyResource.product,
        operation: PolicyOperation.read,
      },
    ],
  },
]
