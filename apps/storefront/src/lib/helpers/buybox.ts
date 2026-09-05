import { OfferDTO } from '@mercurjs/types';

/**
 * `inventory_quantity` is a computed field the store offers route adds when
 * `+inventory_quantity` is requested; it is not part of `OfferDTO`.
 */
export type StoreOffer = OfferDTO & { inventory_quantity?: number | null };

const amountFromPriceRow = (offer: StoreOffer): number | null => {
  const row = offer.prices?.[0];
  if (!row || typeof row.amount !== 'number') {
    return null;
  }
  return row.amount;
};

export const getOfferAmount = (offer: StoreOffer): number | null =>
  offer.calculated_price?.calculated_amount ?? amountFromPriceRow(offer);

export const getOfferCurrency = (
  offer: StoreOffer,
  fallback = 'ils'
): string =>
  offer.calculated_price?.currency_code ||
  offer.prices?.[0]?.currency_code ||
  fallback;

export const getOfferStock = (offer: StoreOffer): number => {
  if (offer.allow_backorder) {
    return Math.max(offer.inventory_quantity ?? 1, 1);
  }
  if (offer.inventory_quantity == null) {
    return 1;
  }
  return offer.inventory_quantity;
};

export const isPurchasable = (offer: StoreOffer): boolean =>
  getOfferStock(offer) > 0;

/**
 * Buybox comparator (best first): in-stock before out-of-stock, then lowest
 * price, then premium seller, then oldest offer as a stable tie-break.
 */
export const compareOffers = (a: StoreOffer, b: StoreOffer): number => {
  const aBuyable = isPurchasable(a);
  const bBuyable = isPurchasable(b);
  if (aBuyable !== bBuyable) return aBuyable ? -1 : 1;

  const aAmount = getOfferAmount(a) ?? Number.POSITIVE_INFINITY;
  const bAmount = getOfferAmount(b) ?? Number.POSITIVE_INFINITY;
  if (aAmount !== bAmount) return aAmount - bAmount;

  const aPremium = a.seller?.is_premium ? 1 : 0;
  const bPremium = b.seller?.is_premium ? 1 : 0;
  if (aPremium !== bPremium) return bPremium - aPremium;

  return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
};

export const rankOffers = (offers: StoreOffer[]): StoreOffer[] =>
  [...offers].sort(compareOffers);

export const getVariantOffers = (
  offers: StoreOffer[],
  variantId: string
): StoreOffer[] =>
  rankOffers(offers.filter((offer) => offer.variant_id === variantId));

/** First purchasable offer in buybox order, else the top-ranked offer. */
export const getBuyboxWinner = (
  rankedOffers: StoreOffer[]
): StoreOffer | undefined =>
  rankedOffers.find(isPurchasable) ?? rankedOffers[0];
