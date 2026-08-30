import { createFindParams } from "@medusajs/medusa/api/utils/validators";
import { z } from "zod";

export type AdminGetVendorParamsType = z.infer<typeof AdminGetVendorParams>;
export const AdminGetVendorParams = createFindParams();

export type AdminCreateVendorType = z.infer<typeof AdminCreateVendor>;
export const AdminCreateVendor = z
  .object({
    name: z.string(),
    handle: z.string().optional(),
    description: z.string().optional().nullable(),
    email: z.string().optional().nullable(),
    phone: z.string().optional().nullable(),
    logo: z.string().optional().nullable(),
    status: z.enum(["pending", "active", "inactive"]).optional(),
  })
  .strict();

export type AdminUpdateVendorType = z.infer<typeof AdminUpdateVendor>;
export const AdminUpdateVendor = AdminCreateVendor.partial().strict();

export type AdminLinkVendorProductsType = z.infer<
  typeof AdminLinkVendorProducts
>;
export const AdminLinkVendorProducts = z
  .object({
    product_ids: z.array(z.string()).min(1),
  })
  .strict();

export type AdminAssignProductVendorType = z.infer<
  typeof AdminAssignProductVendor
>;
export const AdminAssignProductVendor = z
  .object({
    vendor_id: z.string(),
  })
  .strict();
