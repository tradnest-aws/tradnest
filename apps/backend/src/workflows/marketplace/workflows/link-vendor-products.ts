import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { linkVendorProductsStep } from "../steps/link-vendor-products";

export const linkVendorProductsWorkflow = createWorkflow(
  "link-vendor-products",
  function (input: { vendor_id: string; product_ids: string[] }) {
    const result = linkVendorProductsStep(input);

    return new WorkflowResponse(result);
  }
);
