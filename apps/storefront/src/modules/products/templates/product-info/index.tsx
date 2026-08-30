import { getProductVendor } from "@/lib/util/get-product-vendor"
import LocalizedClientLink from "@/modules/common/components/localized-client-link"
import { StoreProductWithVendor } from "@/types/global"
import { Heading, Text } from "@medusajs/ui"

type ProductInfoProps = {
  product: StoreProductWithVendor
}

const ProductInfo = ({ product }: ProductInfoProps) => {
  const vendor = getProductVendor(product)

  return (
    <div id="product-info">
      <div className="flex flex-col gap-y-4 w-full">
        {vendor && (
          <LocalizedClientLink
            href={`/vendors/${vendor.handle}`}
            className="text-sm text-brand-navy hover:text-brand-gold"
          >
            Sold by {vendor.name}
          </LocalizedClientLink>
        )}
        <Heading
          level="h1"
          className="text-[2.5rem] leading-10 text-ui-fg-base"
          data-testid="product-title"
        >
          {product.title}
        </Heading>

        <Text
          className="text-2xl text-ui-fg-subtle whitespace-pre-line"
          data-testid="product-description"
        >
          {product.subtitle}
        </Text>
      </div>
    </div>
  )
}

export default ProductInfo
