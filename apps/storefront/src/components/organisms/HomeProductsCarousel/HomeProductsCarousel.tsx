import { Carousel } from "@/components/cells"
import { ProductCard } from "../ProductCard/ProductCard"
import { listProducts } from "@/lib/data/products"
import { Product } from "@/types/product"

export const HomeProductsCarousel = async ({
  locale,
  sellerProducts,
  home,
}: {
  locale: string
  sellerProducts: Product[]
  home: boolean
}) => {
  const {
    response: { products },
  } = await listProducts({
    countryCode: locale,
    queryParams: {
      limit: home ? 4 : undefined,
      order: "created_at",
      handle: home
        ? undefined
        : sellerProducts.map((product) => product.handle),
    },
  })

  if (!products.length && !sellerProducts.length) return null

  const items = sellerProducts.length ? sellerProducts : products

  if (home) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
        {items.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    )
  }

  return (
    <div className="flex justify-center w-full">
      <Carousel
        align="start"
        items={items.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            className="min-w-[250px] lg:w-[calc(25%-1rem)]"
          />
        ))}
      />
    </div>
  )
}
