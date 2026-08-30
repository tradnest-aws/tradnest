import { createFindParams } from "@medusajs/medusa/api/utils/validators";
import { z } from "zod";

export type StoreGetVendorParamsType = z.infer<typeof StoreGetVendorParams>;
export const StoreGetVendorParams = createFindParams();
