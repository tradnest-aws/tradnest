import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { linkVendorProductsWorkflow } from "../../../../../workflows/marketplace/workflows/link-vendor-products";
import { unlinkVendorProductWorkflow } from "../../../../../workflows/marketplace/workflows/unlink-vendor-product";
import { AdminLinkVendorProductsType } from "../../validators";

export const POST = async (
  req: AuthenticatedMedusaRequest<AdminLinkVendorProductsType>,
  res: MedusaResponse
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const { id } = req.params;

  await linkVendorProductsWorkflow.run({
    input: {
      vendor_id: id,
      product_ids: req.validatedBody.product_ids,
    },
    container: req.scope,
  });

  const {
    data: [vendor],
  } = await query.graph({
    entity: "vendors",
    fields: ["id", "name", "handle", "*products"],
    filters: { id },
  });

  res.json({ vendor });
};

export const DELETE = async (
  req: AuthenticatedMedusaRequest<{ product_id: string }>,
  res: MedusaResponse
) => {
  const { id } = req.params;
  const product_id = (req.query.product_id as string) || req.body?.product_id;

  if (!product_id) {
    res.status(400).json({ message: "product_id is required" });
    return;
  }

  await unlinkVendorProductWorkflow.run({
    input: {
      vendor_id: id,
      product_id,
    },
    container: req.scope,
  });

  res.json({
    id,
    product_id,
    object: "vendor_product",
    deleted: true,
  });
};
