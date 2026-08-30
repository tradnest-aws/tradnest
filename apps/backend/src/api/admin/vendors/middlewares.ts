import {
  validateAndTransformBody,
  validateAndTransformQuery,
} from "@medusajs/framework";
import { MiddlewareRoute } from "@medusajs/medusa";
import { adminVendorQueryConfig } from "./query-config";
import {
  AdminAssignProductVendor,
  AdminCreateVendor,
  AdminGetVendorParams,
  AdminLinkVendorProducts,
  AdminUpdateVendor,
} from "./validators";

export const adminVendorsMiddlewares: MiddlewareRoute[] = [
  {
    method: ["GET"],
    matcher: "/admin/vendors",
    middlewares: [
      validateAndTransformQuery(
        AdminGetVendorParams,
        adminVendorQueryConfig.list
      ),
    ],
  },
  {
    method: ["POST"],
    matcher: "/admin/vendors",
    middlewares: [
      validateAndTransformBody(AdminCreateVendor),
      validateAndTransformQuery(
        AdminGetVendorParams,
        adminVendorQueryConfig.retrieve
      ),
    ],
  },
  {
    method: ["GET"],
    matcher: "/admin/vendors/:id",
    middlewares: [
      validateAndTransformQuery(
        AdminGetVendorParams,
        adminVendorQueryConfig.retrieve
      ),
    ],
  },
  {
    method: ["POST"],
    matcher: "/admin/vendors/:id",
    middlewares: [
      validateAndTransformBody(AdminUpdateVendor),
      validateAndTransformQuery(
        AdminGetVendorParams,
        adminVendorQueryConfig.retrieve
      ),
    ],
  },
  {
    method: ["POST"],
    matcher: "/admin/vendors/:id/products",
    middlewares: [validateAndTransformBody(AdminLinkVendorProducts)],
  },
  {
    method: ["POST"],
    matcher: "/admin/products/:id/vendor",
    middlewares: [validateAndTransformBody(AdminAssignProductVendor)],
  },
];
