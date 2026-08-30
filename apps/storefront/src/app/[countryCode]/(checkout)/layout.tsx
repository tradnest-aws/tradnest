import LocalizedClientLink from "@/modules/common/components/localized-client-link"
import TradnestLogo from "@/modules/common/components/tradnest-logo"
import MedusaCTA from "@/modules/layout/components/medusa-cta"

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="mb-2 w-full bg-white relative small:min-h-screen">
      <div className="h-16 bg-white border-b border-brand-line">
        <nav className="flex h-full items-center content-container justify-between">
          <LocalizedClientLink href="/">
            <TradnestLogo height={32} priority />
          </LocalizedClientLink>
        </nav>
      </div>
      <div className="relative bg-brand-canvas" data-testid="checkout-container">
        {children}
      </div>
      <div className="py-4 w-full flex items-center justify-center">
        <MedusaCTA />
      </div>
    </div>
  )
}
