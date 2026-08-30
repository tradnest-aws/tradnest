import { FetchError } from "@medusajs/js-sdk";
import {
  QueryKey,
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import {
  AdminCreateVendor,
  AdminUpdateVendor,
  AdminVendorResponse,
  AdminVendorsResponse,
  QueryVendor,
} from "../../../types";
import { sdk } from "../../lib/client";
import { queryKeysFactory } from "../../lib/query-key-factory";

export const vendorQueryKey = queryKeysFactory("vendor");

export const useVendors = (
  query?: Record<string, any>,
  options?: UseQueryOptions<
    AdminVendorsResponse,
    FetchError,
    AdminVendorsResponse,
    QueryKey
  >
) => {
  const filterQuery = new URLSearchParams(query).toString();

  return useQuery({
    queryKey: vendorQueryKey.list(query),
    queryFn: () =>
      sdk.client.fetch<AdminVendorsResponse>(
        `/admin/vendors${filterQuery ? `?${filterQuery}` : ""}`,
        { method: "GET" }
      ),
    ...options,
  });
};

export const useVendor = (
  vendorId: string,
  query?: Record<string, any>,
  options?: UseQueryOptions<
    AdminVendorResponse,
    FetchError,
    AdminVendorResponse,
    QueryKey
  >
) => {
  const filterQuery = new URLSearchParams(query).toString();

  return useQuery({
    queryKey: vendorQueryKey.detail(vendorId),
    queryFn: () =>
      sdk.client.fetch<AdminVendorResponse>(
        `/admin/vendors/${vendorId}${filterQuery ? `?${filterQuery}` : ""}`,
        { method: "GET" }
      ),
    ...options,
  });
};

export const useCreateVendor = (
  options?: UseMutationOptions<
    AdminVendorResponse,
    FetchError,
    AdminCreateVendor
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vendor: AdminCreateVendor) =>
      sdk.client.fetch<AdminVendorResponse>("/admin/vendors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: vendor,
      }),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: vendorQueryKey.lists() });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export const useUpdateVendor = (
  vendorId: string,
  options?: UseMutationOptions<
    AdminVendorResponse,
    FetchError,
    AdminUpdateVendor
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vendor: AdminUpdateVendor) =>
      sdk.client.fetch<AdminVendorResponse>(`/admin/vendors/${vendorId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: vendor,
      }),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: vendorQueryKey.lists() });
      queryClient.invalidateQueries({
        queryKey: vendorQueryKey.detail(vendorId),
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export const useDeleteVendor = (
  vendorId: string,
  options?: UseMutationOptions<void, FetchError>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      sdk.client.fetch<void>(`/admin/vendors/${vendorId}`, {
        method: "DELETE",
      }),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: vendorQueryKey.lists() });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export const useProductVendor = (
  productId: string,
  options?: UseQueryOptions<
    { vendor: QueryVendor | null },
    FetchError,
    { vendor: QueryVendor | null },
    QueryKey
  >
) => {
  return useQuery({
    queryKey: ["product-vendor", productId],
    queryFn: () =>
      sdk.client.fetch<{ vendor: QueryVendor | null }>(
        `/admin/products/${productId}/vendor`,
        { method: "GET" }
      ),
    ...options,
  });
};

export const useAssignProductVendor = (
  productId: string,
  options?: UseMutationOptions<
    { vendor: QueryVendor | null },
    FetchError,
    { vendor_id: string }
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: { vendor_id: string }) =>
      sdk.client.fetch<{ vendor: QueryVendor | null }>(
        `/admin/products/${productId}/vendor`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
        }
      ),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: vendorQueryKey.lists() });
      queryClient.invalidateQueries({ queryKey: ["product-vendor", productId] });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export const useUnassignProductVendor = (
  productId: string,
  options?: UseMutationOptions<void, FetchError>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      sdk.client.fetch<void>(`/admin/products/${productId}/vendor`, {
        method: "DELETE",
      }),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: vendorQueryKey.lists() });
      queryClient.invalidateQueries({ queryKey: ["product-vendor", productId] });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};
