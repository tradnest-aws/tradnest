import type { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  const { data: vendors, metadata } = await query.graph({
    entity: "vendors",
    fields: req.queryConfig.fields,
    filters: {
      ...req.filterableFields,
      status: "active",
    },
    pagination: req.queryConfig.pagination,
  });

  res.json({
    vendors,
    count: metadata?.count ?? vendors.length,
    offset: metadata?.skip ?? 0,
    limit: metadata?.take ?? vendors.length,
  });
};
