import { ProductPageAccordion } from '@/components/molecules';
import { headers } from 'next/headers';
import { DEFAULT_STOREFRONT_LOCALE, getCopy } from '@/lib/i18n/copy';

export const ProductDetailsShipping = async () => {
  const locale =
    (await headers()).get('x-locale') || DEFAULT_STOREFRONT_LOCALE;
  const t = getCopy(locale);

  return (
    <ProductPageAccordion
      heading={t.shippingReturns}
      defaultOpen={false}
    >
      <div className='product-details'>
        <ul>
          <li>{t.shippingReturnsBody}</li>
        </ul>
      </div>
    </ProductPageAccordion>
  );
};
