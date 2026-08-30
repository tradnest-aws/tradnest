import { clx } from "@medusajs/ui"
import Image from "next/image"

type TradnestLogoProps = {
  className?: string
  markOnly?: boolean
  height?: number
  priority?: boolean
}

const LOGO_ASPECT = 1432 / 691

const TradnestLogo = ({
  className,
  markOnly = false,
  height = 36,
  priority = false,
}: TradnestLogoProps) => {
  if (markOnly) {
    return (
      <Image
        src="/tradnest-icon.png"
        alt="Tradnest"
        width={height}
        height={height}
        className={clx("rounded-[22%] object-contain", className)}
        priority={priority}
      />
    )
  }

  return (
    <Image
      src="/tradnest-logo.png"
      alt="Tradnest"
      width={Math.round(height * LOGO_ASPECT)}
      height={height}
      className={clx("h-auto w-auto max-h-full object-contain object-left", className)}
      style={{ height }}
      priority={priority}
    />
  )
}

export default TradnestLogo
