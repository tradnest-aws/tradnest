import { SellerDTO } from '@mercurjs/types';

import { sdk } from '../client';
import { decodeSellerHandle, sellerMatchesHandle } from '../helpers/seller-handle';

const SELLER_FIELDS =
  'id,name,handle,description,logo,banner,is_premium,metadata';

async function querySellers(
  params: Record<string, unknown>
): Promise<SellerDTO[]> {
  try {
    const { sellers } = (await (sdk.store.sellers.query({
      ...params,
      fields: SELLER_FIELDS,
      fetchOptions: { cache: 'no-cache' },
    } as never) as unknown as Promise<{ sellers?: SellerDTO[] }>)) ?? {
      sellers: [],
    };
    return sellers ?? [];
  } catch {
    return [];
  }
}

export const getSellerByHandle = async (
  handle: string
): Promise<SellerDTO | null> => {
  const decoded = decodeSellerHandle(handle);

  const byHandle = await querySellers({ handle: decoded });
  const exact =
    byHandle.find((seller) => sellerMatchesHandle(seller, decoded)) ??
    (byHandle.length === 1 ? byHandle[0] : null);
  if (exact) return exact;

  const sellers = await querySellers({ limit: 100 });
  return sellers.find((seller) => sellerMatchesHandle(seller, decoded)) ?? null;
};
