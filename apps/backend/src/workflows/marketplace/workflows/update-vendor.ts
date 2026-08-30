import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { ModuleUpdateVendor } from "../../../types";
import { updateVendorStep } from "../steps/update-vendor";

export const updateVendorWorkflow = createWorkflow(
  "update-vendor",
  function (input: ModuleUpdateVendor) {
    const vendor = updateVendorStep(input);

    return new WorkflowResponse(vendor);
  }
);
