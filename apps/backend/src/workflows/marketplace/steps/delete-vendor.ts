import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { MARKETPLACE_MODULE } from "../../../../modules/marketplace";
import MarketplaceModuleService from "../../../../modules/marketplace/service";

export const deleteVendorStep = createStep(
  "delete-vendor",
  async (id: string, { container }) => {
    const marketplace: MarketplaceModuleService =
      container.resolve(MARKETPLACE_MODULE);

    await marketplace.softDeleteVendors(id);

    return new StepResponse(id, id);
  },
  async (id, { container }) => {
    if (!id) {
      return;
    }

    const marketplace: MarketplaceModuleService =
      container.resolve(MARKETPLACE_MODULE);

    await marketplace.restoreVendors(id);
  }
);
