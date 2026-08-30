import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { deleteVendorStep } from "../steps/delete-vendor";

export const deleteVendorWorkflow = createWorkflow(
  "delete-vendor",
  function (input: { id: string }) {
    deleteVendorStep(input.id);

    return new WorkflowResponse(undefined);
  }
);
