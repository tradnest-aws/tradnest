import { getCartApprovalStatus } from "@/lib/util/get-cart-approval-status"
import { convertToLocale } from "@/lib/util/money"
import { getProductVendor } from "@/lib/util/get-product-vendor"
import ItemFull from "@/modules/cart/components/item-full"
import LocalizedClientLink from "@/modules/common/components/localized-client-link"
import { B2BCart, StoreProductWithVendor } from "@/types/global"
import { StoreCartLineItem } from "@medusajs/types"
import { Container, Text } from "@medusajs/ui"
import { useMemo } from "react"

type ItemsTemplateProps = {
  cart: B2BCart
  showBorders?: boolean
  showTotal?: boolean
}

const ItemsTemplate = ({
  cart,
  showBorders = true,
  showTotal = true,
}: ItemsTemplateProps) => {
  const items = cart?.items
  const totalQuantity = useMemo(
    () => cart?.items?.reduce((acc, item) => acc + item.quantity, 0),
    [cart?.items]
  )

  const groupedItems = useMemo(() => {
    const groups = new Map<
      string,
      { label: string; handle?: string; items: StoreCartLineItem[] }
    >()

    for (const item of items || []) {
      const vendor = getProductVendor(
        item.product as StoreProductWithVendor | undefined
      )
      const key = vendor?.id || "unassigned"
      const existing = groups.get(key)

      if (existing) {
        existing.items.push(item)
      } else {
        groups.set(key, {
          label: vendor?.name || "Unassigned vendor",
          handle: vendor?.handle,
          items: [item],
        })
      }
    }

    return Array.from(groups.values())
  }, [items])

  const { isPendingAdminApproval, isPendingSalesManagerApproval } =
    getCartApprovalStatus(cart)

  const isPendingApproval =
    isPendingAdminApproval || isPendingSalesManagerApproval

  return (
    <div className="w-full flex flex-col gap-y-2">
      <div className="flex flex-col gap-y-4 w-full">
        {groupedItems.map((group) => (
          <div key={group.label} className="flex flex-col gap-y-2">
            <Text className="text-sm font-medium">
              {group.handle ? (
                <LocalizedClientLink
                  href={`/vendors/${group.handle}`}
                  className="hover:text-ui-fg-interactive"
                >
                  {group.label}
                </LocalizedClientLink>
              ) : (
                group.label
              )}
            </Text>
            {group.items.map((item) => (
              <ItemFull
                disabled={isPendingApproval}
                currencyCode={cart?.currency_code}
                showBorders={showBorders}
                key={item.id}
                item={
                  item as StoreCartLineItem & {
                    metadata?: { note?: string }
                  }
                }
              />
            ))}
          </div>
        ))}
      </div>
      {showTotal && (
        <Container>
          <div className="flex items-start justify-between h-full self-stretch">
            <Text>Total: {totalQuantity} items</Text>
            <Text>
              {convertToLocale({
                amount: cart?.item_total,
                currency_code: cart?.currency_code,
              })}
            </Text>
          </div>
        </Container>
      )}
    </div>
  )
}

export default ItemsTemplate
