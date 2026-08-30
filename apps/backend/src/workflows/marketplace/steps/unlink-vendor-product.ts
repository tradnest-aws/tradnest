import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils";
import { MARKETPLACE_MODULE } from "../../../../modules/marketplace";

type UnlinkVendorProductInput = {
  vendor_id: string;
  product_id: string;
};

export const unlinkVendorProductStep = createStep(
  "unlink-vendor-product",
  async (input: UnlinkVendorProductInput, { container }) => {
    const link = container.resolve(ContainerRegistrationKeys.LINK);

    await link.dismiss({
      [MARKETPLACE_MODULE]: {
        vendor_id: input.vendor_id,
      },
      [Modules.PRODUCT]: {
        product_id: input.product_id,
      },
    });

    return new StepResponse(input, input);
  },
  async (input, { container }) => {
    if (!input) {
      return;
    }

    const link = container.resolve(ContainerRegistrationKeys.LINK);

    await link.create({
      [MARKETPLACE_MODULE]: {
        vendor_id: input.vendor_id,
      },
      [Modules.PRODUCT]: {
        product_id: input.product_id,
      },
    });
  }
);
