import { model } from "@medusajs/framework/utils";
import { Vendor } from "./vendor";

export const VendorAdmin = model.define("vendor_admin", {
  id: model
    .id({
      prefix: "venadm",
    })
    .primaryKey(),
  first_name: model.text().nullable(),
  last_name: model.text().nullable(),
  email: model.text().unique(),
  vendor: model.belongsTo(() => Vendor, {
    mappedBy: "admins",
  }),
});
