import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { linkVendorProductsWorkflow } from "../../../../../workflows/marketplace/workflows/link-vendor-products";
import { unlinkVendorProductWorkflow } from "../../../../../workflows/marketplace/workflows/unlink-vendor-product";
import { AdminAssignProductVendorType } from "../../../vendors/validators";

const asVendor = (vendor: unknown) => {
  if (!vendor) {
    return null;
  }

  return Array.isArray(vendor) ? vendor[0] || null : vendor;
};

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const { id } = req.params;

  const {
    data: [product],
  } = await query.graph({
    entity: "product",
    fields: ["id", "vendor.*"],
    filters: { id },
  });

  res.json({ vendor: asVendor(product?.vendor) });
};

export const POST = async (
  req: AuthenticatedMedusaRequest<AdminAssignProductVendorType>,
  res: MedusaResponse
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const { id } = req.params;

  await linkVendorProductsWorkflow.run({
    input: {
      vendor_id: req.validatedBody.vendor_id,
      product_ids: [id],
    },
    container: req.scope,
  });

  const {
    data: [product],
  } = await query.graph({
    entity: "product",
    fields: ["id", "vendor.*"],
    filters: { id },
  });

  res.json({ vendor: asVendor(product?.vendor) });
};

export const DELETE = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const { id } = req.params;

  const {
    data: [product],
  } = await query.graph({
    entity: "product",
    fields: ["id", "vendor.id"],
    filters: { id },
  });

  const vendor = Array.isArray(product?.vendor)
    ? product.vendor[0]
    : product?.vendor;

  if (vendor?.id) {
    await unlinkVendorProductWorkflow.run({
      input: {
        vendor_id: vendor.id,
        product_id: id,
      },
      container: req.scope,
    });
  }

  res.json({
    id,
    object: "product_vendor",
    deleted: true,
  });
};
