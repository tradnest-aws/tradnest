import { retrieveCart } from "@/lib/data/cart"
import { retrieveCustomer } from "@/lib/data/customer"
import { listCartFreeShippingPrices } from "@/lib/data/fulfillment"
import { getBaseURL } from "@/lib/util/env"
import CartMismatchBanner from "@/modules/layout/components/cart-mismatch-banner"
import Footer from "@/modules/layout/templates/footer"
import { NavigationHeader } from "@/modules/layout/templates/nav"
import FreeShippingPriceNudge from "@/modules/shipping/components/free-shipping-price-nudge"
import { StoreFreeShippingPrice } from "@/types/shipping-option/http"
import { StoreCart } from "@medusajs/types"
import { Metadata } from "next"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default async function PageLayout(props: { children: React.ReactNode }) {
  const customer = await retrieveCustomer().catch(() => null)
  const cart = await retrieveCart()
  let freeShippingPrices: StoreFreeShippingPrice[] = []

  if (cart) {
    freeShippingPrices = await listCartFreeShippingPrices(cart.id)
  }

  return (
    <>
      <NavigationHeader />
      <div className="flex items-center text-neutral-50 justify-center small:p-4 p-2 text-center bg-neutral-900 small:gap-2 gap-1 text-sm">
        <span>
          Company buyers: request quotes, apply spending limits, and send orders
          for approval.
        </span>
      </div>

      {customer && cart && (
        <CartMismatchBanner customer={customer} cart={cart} />
      )}

      {props.children}

      <Footer />

      {cart && freeShippingPrices && (
        <FreeShippingPriceNudge
          variant="popup"
          cart={cart as StoreCart}
          freeShippingPrices={freeShippingPrices}
        />
      )}
    </>
  )
}
