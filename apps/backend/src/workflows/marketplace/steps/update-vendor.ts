import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { MARKETPLACE_MODULE } from "../../../../modules/marketplace";
import MarketplaceModuleService from "../../../../modules/marketplace/service";
import { ModuleUpdateVendor, QueryVendor } from "../../../../types";

export const updateVendorStep = createStep(
  "update-vendor",
  async (input: ModuleUpdateVendor, { container }) => {
    const marketplace: MarketplaceModuleService =
      container.resolve(MARKETPLACE_MODULE);

    const [previousData] = await marketplace.listVendors({
      id: input.id,
    });

    const vendor = await marketplace.updateVendors(input);

    return new StepResponse(vendor, previousData as QueryVendor);
  },
  async (previousData, { container }) => {
    if (!previousData) {
      return;
    }

    const marketplace: MarketplaceModuleService =
      container.resolve(MARKETPLACE_MODULE);

    await marketplace.updateVendors(previousData);
  }
);
