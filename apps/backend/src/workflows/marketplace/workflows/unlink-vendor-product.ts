import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { unlinkVendorProductStep } from "../steps/unlink-vendor-product";

export const unlinkVendorProductWorkflow = createWorkflow(
  "unlink-vendor-product",
  function (input: { vendor_id: string; product_id: string }) {
    const result = unlinkVendorProductStep(input);

    return new WorkflowResponse(result);
  }
);
