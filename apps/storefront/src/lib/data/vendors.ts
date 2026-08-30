"use server"

import { sdk } from "@/lib/config"
import { getAuthHeaders, getCacheOptions } from "@/lib/data/cookies"
import { StoreVendor, StoreVendorResponse, StoreVendorsResponse } from "@/types"

export const listVendors = async () => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("vendors")),
  }

  return sdk.client.fetch<StoreVendorsResponse>(`/store/vendors`, {
    credentials: "include",
    method: "GET",
    query: {
      limit: 100,
      fields: "id,handle,name,description,logo,email,status",
    },
    headers,
    next,
  })
}

export const getVendor = async (idOrHandle: string) => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("vendors")),
  }

  return sdk.client
    .fetch<StoreVendorResponse>(`/store/vendors/${idOrHandle}`, {
      credentials: "include",
      method: "GET",
      query: {
        fields: "id,handle,name,description,logo,email,phone,status,*products",
      },
      headers,
      next,
    })
    .then(({ vendor }) => vendor as StoreVendor)
    .catch(() => null)
}
