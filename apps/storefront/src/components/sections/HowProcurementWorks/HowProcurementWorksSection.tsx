import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { ArrowRightIcon } from "@/icons"

const steps = [
  {
    title: "Create a buyer account",
    body: "Register with your company details so suppliers can quote against a verified business profile.",
  },
  {
    title: "Compare supplier offers",
    body: "One master product, many vendors. Compare unit price, stock, and lead time before you buy or RFQ.",
  },
  {
    title: "Order or request a quote",
    body: "Add in-stock offers to a multi-vendor cart, or send a quote request for volume and contract pricing.",
  },
]

export function HowProcurementWorksSection() {
  return (
    <section className="bg-primary container" data-testid="how-procurement-works">
      <h2 className="heading-lg text-primary mb-8 uppercase">How procurement works</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3">
        {steps.map((step, index) => (
          <div key={step.title} className="border rounded-sm p-6">
            <p className="label-sm text-secondary mb-3">0{index + 1}</p>
            <h3 className="heading-md mb-3">{step.title}</h3>
            <p className="label-md text-secondary">{step.body}</p>
          </div>
        ))}
      </div>
      <LocalizedClientLink
        href="/register"
        className="inline-flex items-center gap-2 mt-8 heading-sm uppercase"
        data-testid="how-procurement-register-link"
      >
        Open a buyer account
        <ArrowRightIcon />
      </LocalizedClientLink>
    </section>
  )
}
