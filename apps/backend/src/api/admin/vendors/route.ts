import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { createVendorWorkflow } from "../../../workflows/marketplace/workflows/create-vendor";
import { AdminCreateVendorType } from "./validators";

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  const { data: vendors, metadata } = await query.graph({
    entity: "vendors",
    fields: req.queryConfig.fields,
    filters: req.filterableFields,
    pagination: req.queryConfig.pagination,
  });

  res.json({
    vendors,
    count: metadata?.count ?? vendors.length,
    offset: metadata?.skip ?? 0,
    limit: metadata?.take ?? vendors.length,
  });
};

export const POST = async (
  req: AuthenticatedMedusaRequest<AdminCreateVendorType>,
  res: MedusaResponse
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  const { result } = await createVendorWorkflow.run({
    input: req.validatedBody,
    container: req.scope,
  });

  const {
    data: [vendor],
  } = await query.graph(
    {
      entity: "vendors",
      fields: req.queryConfig.fields,
      filters: { id: result.id },
    },
    { throwIfKeyNotFound: true }
  );

  res.json({ vendor });
};
