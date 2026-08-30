import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { deleteVendorWorkflow } from "../../../../workflows/marketplace/workflows/delete-vendor";
import { updateVendorWorkflow } from "../../../../workflows/marketplace/workflows/update-vendor";
import { AdminUpdateVendorType } from "../validators";

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const { id } = req.params;

  const {
    data: [vendor],
  } = await query.graph(
    {
      entity: "vendors",
      fields: req.queryConfig.fields,
      filters: { id },
    },
    { throwIfKeyNotFound: true }
  );

  res.json({ vendor });
};

export const POST = async (
  req: AuthenticatedMedusaRequest<AdminUpdateVendorType>,
  res: MedusaResponse
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const { id } = req.params;

  await updateVendorWorkflow.run({
    input: { ...req.validatedBody, id },
    container: req.scope,
  });

  const {
    data: [vendor],
  } = await query.graph(
    {
      entity: "vendors",
      fields: req.queryConfig.fields,
      filters: { id },
    },
    { throwIfKeyNotFound: true }
  );

  res.json({ vendor });
};

export const DELETE = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const { id } = req.params;

  await deleteVendorWorkflow.run({
    input: { id },
    container: req.scope,
  });

  res.json({
    id,
    object: "vendor",
    deleted: true,
  });
};
