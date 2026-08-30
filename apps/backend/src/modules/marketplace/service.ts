import { MedusaService } from "@medusajs/framework/utils";
import { Vendor, VendorAdmin } from "./models";

class MarketplaceModuleService extends MedusaService({
  Vendor,
  VendorAdmin,
}) {}

export default MarketplaceModuleService;
