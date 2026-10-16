import { SellerDTO } from '@mercurjs/types';

import { sdk } from '../client';
import { decodeSellerHandle, sellerMatchesHandle } from '../helpers/seller-handle';

const SELLER_FIELDS =
  'id,name,handle,description,logo,banner,is_premium,metadata';

const SELLER_CONTACT_FIELDS =
  `${SELLER_FIELDS},email,phone,website_url,` +
  'address.address_1,address.address_2,address.city,address.postal_code,address.phone';

const REVIEW_FIELDS =
  'id,reviews.id,reviews.rating,reviews.customer_note,reviews.seller_note,' +
  'reviews.created_at,reviews.updated_at,reviews.status,' +
  'reviews.customer.first_name,reviews.customer.last_name';

export type SellerReviewRecord = {
  id: string;
  rating?: number | null;
  customer_note?: string | null;
  seller_note?: string | null;
  created_at?: string;
  updated_at?: string;
  status?: string | null;
  customer?: { first_name?: string | null; last_name?: string | null } | null;
};

async function querySellers(
  params: Record<string, unknown>,
  fields: string
): Promise<{ ok: boolean; sellers: SellerDTO[] }> {
  try {
    const { sellers } = (await (sdk.store.sellers.query({
      ...params,
      fields,
      fetchOptions: { cache: 'no-cache' },
    } as never) as unknown as Promise<{ sellers?: SellerDTO[] }>)) ?? {
      sellers: [],
    };
    return { ok: true, sellers: sellers ?? [] };
  } catch {
    return { ok: false, sellers: [] };
  }
}

async function querySellersWithContact(
  params: Record<string, unknown>
): Promise<SellerDTO[]> {
  const withContact = await querySellers(params, SELLER_CONTACT_FIELDS);
  if (withContact.ok) return withContact.sellers;
  const basic = await querySellers(params, SELLER_FIELDS);
  return basic.sellers;
}

export const getSellerByHandle = async (
  handle: string
): Promise<SellerDTO | null> => {
  const decoded = decodeSellerHandle(handle);

  const byHandle = await querySellersWithContact({ handle: decoded });
  const exact =
    byHandle.find((seller) => sellerMatchesHandle(seller, decoded)) ??
    (byHandle.length === 1 ? byHandle[0] : null);
  if (exact) return exact;

  const sellers = await querySellersWithContact({ limit: 100 });
  return sellers.find((seller) => sellerMatchesHandle(seller, decoded)) ?? null;
};

export const listSellerReviews = async (
  sellerId: string
): Promise<SellerReviewRecord[]> => {
  try {
    const { sellers } = (await (sdk.store.sellers.query({
      id: sellerId,
      limit: 1,
      fields: REVIEW_FIELDS,
      fetchOptions: { cache: 'no-cache' },
    } as never) as unknown as Promise<{
      sellers?: { reviews?: SellerReviewRecord[] }[];
    }>)) ?? { sellers: [] };
    const reviews = sellers?.[0]?.reviews ?? [];
    return reviews.filter(
      (review) => !review.status || review.status === 'published'
    );
  } catch {
    return [];
  }
};
