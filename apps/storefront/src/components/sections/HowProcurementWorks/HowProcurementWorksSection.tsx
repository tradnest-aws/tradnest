import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { ArrowRightIcon } from "@/icons"

const steps = [
  {
    title: "חשבון רוכש",
    body: "נרשמים עם פרטי החברה כדי שספקים יוכלו לתת הצעת מחיר לעסק מאומת.",
  },
  {
    title: "השוואת הצעות",
    body: "מוצר אחד, כמה ספקים. משווים מחיר יחידה, מלאי וזמן אספקה לפני הזמנה או בקשת הצעה.",
  },
  {
    title: "הזמנה או הצעת מחיר",
    body: "מוסיפים הצעות במלאי לעגלה, או שולחים בקשת הצעת מחיר לכמויות ולחוזים.",
  },
]

export function HowProcurementWorksSection() {
  return (
    <section className="bg-primary container" data-testid="how-procurement-works">
      <h2 className="heading-lg text-primary mb-8 uppercase">איך הרכש עובד</h2>
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
        פתיחת חשבון רוכש
        <ArrowRightIcon />
      </LocalizedClientLink>
    </section>
  )
}
