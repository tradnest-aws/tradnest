"use client"

import { convertToLocale } from '@/lib/helpers/money';
import { useCopy } from '@/lib/i18n/useCopy';

export const CartItemsFooter = ({
  currency_code,
  price,
}: {
  currency_code: string;
  price: number;
}) => {
  const t = useCopy();
  return (
    <div className='border rounded-sm p-4 flex items-center justify-between label-md'>
      <p className='text-secondary'>{t.delivery}</p>
      <p>
        {convertToLocale({
          amount: price / 1,
          currency_code,
        })}
      </p>
    </div>
  );
};
