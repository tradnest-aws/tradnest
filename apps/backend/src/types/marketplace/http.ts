import { PaginatedResponse } from "@medusajs/types";
import { ModuleCreateVendor, ModuleUpdateVendor } from "./module";
import { QueryVendor } from "./query";

export type AdminVendorResponse = {
  vendor: QueryVendor;
};

export type AdminVendorsResponse = PaginatedResponse<{
  vendors: QueryVendor[];
}>;

export type AdminCreateVendor = ModuleCreateVendor;
export type AdminUpdateVendor = Omit<ModuleUpdateVendor, "id">;

export type StoreVendorResponse = {
  vendor: QueryVendor;
};

export type StoreVendorsResponse = PaginatedResponse<{
  vendors: QueryVendor[];
}>;
