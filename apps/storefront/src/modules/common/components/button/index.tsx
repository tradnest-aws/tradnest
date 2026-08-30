import { clx, Button as MedusaButton } from "@medusajs/ui"
type ButtonProps = React.ComponentProps<typeof MedusaButton>

const Button = ({
  children,
  className: classNameProp,
  ...props
}: ButtonProps): React.ReactNode => {
  const variant = props.variant ?? "primary"

  const className = clx(classNameProp, {
    "!shadow-borders-base !border-brand-line !text-brand-navy hover:!bg-brand-canvas":
      variant === "secondary" || props.disabled,
    "!shadow-none !bg-brand-navy !text-white hover:!bg-brand-navy-soft":
      variant === "primary" && !props.disabled,
    "!shadow-none bg-transparent !text-brand-navy": variant === "transparent",
  })
  return (
    <MedusaButton
      className={`!rounded-full text-sm font-normal ${className}`}
      variant={variant}
      {...props}
    >
      {children}
    </MedusaButton>
  )
}

export default Button
