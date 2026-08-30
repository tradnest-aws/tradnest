import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils";
import { MARKETPLACE_MODULE } from "../../../../modules/marketplace";

type LinkVendorProductsInput = {
  vendor_id: string;
  product_ids: string[];
};

export const linkVendorProductsStep = createStep(
  "link-vendor-products",
  async (input: LinkVendorProductsInput, { container }) => {
    const link = container.resolve(ContainerRegistrationKeys.LINK);
    const query = container.resolve(ContainerRegistrationKeys.QUERY);

    const { data: products } = await query.graph({
      entity: "product",
      fields: ["id", "vendor.id"],
      filters: { id: input.product_ids },
    });

    const previousLinks = (products || [])
      .map((product: { id: string; vendor?: { id?: string } | { id?: string }[] }) => {
        const vendor = Array.isArray(product.vendor)
          ? product.vendor[0]
          : product.vendor;

        if (!vendor?.id) {
          return null;
        }

        return {
          vendor_id: vendor.id,
          product_id: product.id,
        };
      })
      .filter(Boolean) as { vendor_id: string; product_id: string }[];

    for (const previous of previousLinks) {
      await link.dismiss({
        [MARKETPLACE_MODULE]: {
          vendor_id: previous.vendor_id,
        },
        [Modules.PRODUCT]: {
          product_id: previous.product_id,
        },
      });
    }

    await link.create(
      input.product_ids.map((product_id) => ({
        [MARKETPLACE_MODULE]: {
          vendor_id: input.vendor_id,
        },
        [Modules.PRODUCT]: {
          product_id,
        },
      }))
    );

    return new StepResponse(input, { previousLinks, input });
  },
  async (compensateInput, { container }) => {
    if (!compensateInput) {
      return;
    }

    const link = container.resolve(ContainerRegistrationKeys.LINK);
    const { previousLinks, input } = compensateInput;

    await link.dismiss(
      input.product_ids.map((product_id) => ({
        [MARKETPLACE_MODULE]: {
          vendor_id: input.vendor_id,
        },
        [Modules.PRODUCT]: {
          product_id,
        },
      }))
    );

    if (previousLinks.length) {
      await link.create(
        previousLinks.map((previous) => ({
          [MARKETPLACE_MODULE]: {
            vendor_id: previous.vendor_id,
          },
          [Modules.PRODUCT]: {
            product_id: previous.product_id,
          },
        }))
      );
    }
  }
);
