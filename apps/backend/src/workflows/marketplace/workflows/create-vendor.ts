import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { ModuleCreateVendor } from "../../../types";
import { createVendorStep } from "../steps/create-vendor";

export const createVendorWorkflow = createWorkflow(
  "create-vendor",
  function (input: ModuleCreateVendor) {
    const vendor = createVendorStep(input);

    return new WorkflowResponse(vendor);
  }
);
