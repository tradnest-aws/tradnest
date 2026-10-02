"use client"
import { signout } from "@/lib/data/customer"
import { cn } from "@/lib/utils"
import { useCopy } from "@/lib/i18n/useCopy"

type LogoutButtonProps = {
  unstyled?: boolean
  "data-testid"?: string
} & React.ButtonHTMLAttributes<HTMLButtonElement>

export const LogoutButton: React.FC<LogoutButtonProps> = ({
  unstyled,
  className,
  children,
  "data-testid": dataTestId,
}) => {
  const t = useCopy()
  const handleLogout = async () => {
    await signout()
  }

  return (
    <button
      onClick={handleLogout}
      className={cn(
        !unstyled && "label-md uppercase px-4 py-3 my-3 md:my-0",
        className
      )}
      data-testid={dataTestId}
    >
      {children || t.logout}
    </button>
  )
}
