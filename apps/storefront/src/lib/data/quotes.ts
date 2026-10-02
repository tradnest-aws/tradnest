'use server';

import { QuoteRequestDTO } from '@mercurjs/types';

import { sdk } from '../client';
import medusaError from '../helpers/medusa-error';
import { getAuthHeaders } from './cookies';

type QuoteRequestListResponse = {
  quote_requests: QuoteRequestDTO[];
  count: number;
};

type QuoteRequestResponse = {
  quote_request: QuoteRequestDTO;
};

export type CreateQuoteRequestInput = {
  seller_id: string;
  product_id: string;
  product_title?: string | null;
  offer_id?: string | null;
  variant_id?: string | null;
  quantity: number;
  message?: string | null;
  target_delivery?: string | null;
  company_name?: string | null;
};

export const listQuoteRequests = async (): Promise<QuoteRequestListResponse> => {
  return (
    sdk.store.quoteRequests.query({
      fetchOptions: {
        headers: { ...(await getAuthHeaders()) },
        cache: 'no-store'
      }
    } as never) as unknown as Promise<QuoteRequestListResponse>
  )
    .then(res => res)
    .catch(err => medusaError(err));
};

export const createQuoteRequest = async (
  input: CreateQuoteRequestInput
): Promise<QuoteRequestDTO> => {
  return (
    sdk.store.quoteRequests.mutate({
      ...input,
      fetchOptions: {
        headers: { ...(await getAuthHeaders()) }
      }
    } as never) as unknown as Promise<QuoteRequestResponse>
  )
    .then(({ quote_request }) => quote_request)
    .catch(err => medusaError(err));
};

export const cancelQuoteRequest = async (id: string): Promise<QuoteRequestDTO> => {
  return (
    sdk.store.quoteRequests.$id.mutate({
      $id: id,
      fetchOptions: {
        headers: { ...(await getAuthHeaders()) }
      }
    } as never) as unknown as Promise<QuoteRequestResponse>
  )
    .then(({ quote_request }) => quote_request)
    .catch(err => medusaError(err));
};
