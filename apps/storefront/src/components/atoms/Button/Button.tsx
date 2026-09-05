import { cn } from "@/lib/utils"

import Spinner from "@/icons/spinner"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "filled" | "tonal" | "text" | "destructive"
  size?: "small" | "large"
  loading?: boolean
  href?: string
  "data-testid"?: string
}

export function Button({
  children,
  variant = "filled",
  size = "small",
  loading = false,
  disabled = false,
  className,
  href,
  "data-testid": dataTestId,
  ...props
}: ButtonProps) {
  const baseClasses =
    "text-md button-text rounded-sm disabled:bg-disabled disabled:text-disabled dark:bg-action-tertiary dark:hover:bg-action-tertiary-hover dark:active:bg-action-tertiary-pressed dark:disabled:bg-disabled"

  const variantClasses = {
    filled: `bg-action !text-white hover:bg-action-hover active:bg-action-pressed ${
      loading && "button-text-filled"
    }`,
    tonal:
      "bg-action-secondary hover:bg-action-secondary-hover active:bg-action-secondary-pressed text-action-on-secondary",
    text: "bg-primary dark:bg-primary hover:bg-action-secondary-hover active:bg-action-secondary-pressed text-primary",
    destructive: `text-negative-on-primary bg-negative hover:bg-negative-hover active:bg-negative-pressed ${
      loading && "button-text-filled"
    }`,
  }

  const sizeClasses = {
    small: "px-[16px] py-[8px]",
    large: "px-[24px] py-[8px]",
  }

  const classes = cn(
    variantClasses[variant],
    sizeClasses[size],
    baseClasses,
    className
  )
  const testId = dataTestId ?? `button-${variant}-${size}`

  if (href) {
    return (
      <a
        href={href}
        className={`${classes} inline-block`}
        data-testid={testId}
        aria-disabled={disabled || undefined}
      >
        {loading ? <Spinner /> : children}
      </a>
    )
  }

  return (
    <button
      disabled={disabled}
      className={classes}
      data-testid={testId}
      {...props}
    >
      {loading ? <Spinner /> : children}
    </button>
  )
}
