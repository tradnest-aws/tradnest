import { HttpTypes } from "@medusajs/types";

import { retrieveActiveStore } from "../../hooks/api/store";

export type OnboardingLoaderData = {
  store?: HttpTypes.AdminStore;
};

export const onboardingLoader = async (): Promise<OnboardingLoaderData> => {
  try {
    return await retrieveActiveStore();
  } catch {
    // New suppliers have no store yet. A thrown ClientError 404 is rendered
    // as the vendor "no page at this address" screen instead of the wizard.
    return {};
  }
};
