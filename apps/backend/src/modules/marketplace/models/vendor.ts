import { model } from "@medusajs/framework/utils";
import { VendorAdmin } from "./vendor-admin";

export const Vendor = model.define("vendor", {
  id: model
    .id({
      prefix: "ven",
    })
    .primaryKey(),
  handle: model.text().unique(),
  name: model.text(),
  description: model.text().nullable(),
  email: model.text().nullable(),
  phone: model.text().nullable(),
  logo: model.text().nullable(),
  status: model.enum(["pending", "active", "inactive"]).default("active"),
  admins: model.hasMany(() => VendorAdmin, {
    mappedBy: "vendor",
  }),
});
