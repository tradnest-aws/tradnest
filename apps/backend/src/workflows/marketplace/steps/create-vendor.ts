import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { MARKETPLACE_MODULE } from "../../../../modules/marketplace";
import MarketplaceModuleService from "../../../../modules/marketplace/service";
import { ModuleCreateVendor } from "../../../../types";
import { slugifyHandle } from "../../../../utils/slugify-handle";

export const createVendorStep = createStep(
  "create-vendor",
  async (input: ModuleCreateVendor, { container }) => {
    const marketplace: MarketplaceModuleService =
      container.resolve(MARKETPLACE_MODULE);

    const handle = input.handle?.trim() || slugifyHandle(input.name);
    const existing = await marketplace.listVendors({ handle });

    const vendor = await marketplace.createVendors({
      ...input,
      handle: existing.length
        ? `${handle}-${Date.now().toString(36)}`
        : handle,
    });

    return new StepResponse(vendor, vendor.id);
  },
  async (vendorId, { container }) => {
    if (!vendorId) {
      return;
    }

    const marketplace: MarketplaceModuleService =
      container.resolve(MARKETPLACE_MODULE);

    await marketplace.deleteVendors(vendorId);
  }
);
