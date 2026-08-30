import { HttpTypes } from "@medusajs/types";
import { ModuleVendor } from "./module";

export type QueryVendor = ModuleVendor & {
  products?: HttpTypes.AdminProduct[];
};
