import type { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const { id } = req.params;

  const isHandle = !id.startsWith("ven_");

  const {
    data: [vendor],
  } = await query.graph({
    entity: "vendors",
    fields: req.queryConfig.fields,
    filters: isHandle
      ? { handle: id, status: "active" }
      : { id, status: "active" },
  });

  if (!vendor) {
    res.status(404).json({ message: "Vendor not found" });
    return;
  }

  res.json({ vendor });
};
