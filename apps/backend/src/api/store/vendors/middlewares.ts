import { validateAndTransformQuery } from "@medusajs/framework";
import { MiddlewareRoute } from "@medusajs/medusa";
import { storeVendorQueryConfig } from "./query-config";
import { StoreGetVendorParams } from "./validators";

export const storeVendorsMiddlewares: MiddlewareRoute[] = [
  {
    method: ["GET"],
    matcher: "/store/vendors",
    middlewares: [
      validateAndTransformQuery(
        StoreGetVendorParams,
        storeVendorQueryConfig.list
      ),
    ],
  },
  {
    method: ["GET"],
    matcher: "/store/vendors/:id",
    middlewares: [
      validateAndTransformQuery(
        StoreGetVendorParams,
        storeVendorQueryConfig.retrieve
      ),
    ],
  },
];
