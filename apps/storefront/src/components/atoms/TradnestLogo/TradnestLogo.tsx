import Image from "next/image"

type TradnestLogoProps = {
  className?: string
  markOnly?: boolean
  height?: number
  priority?: boolean
}

const LOGO_ASPECT = 1432 / 691

export const TradnestLogo = ({
  className,
  markOnly = false,
  height = 40,
  priority = false,
}: TradnestLogoProps) => {
  if (markOnly) {
    return (
      <Image
        src="/tradnest-icon.png"
        alt="Tradnest"
        width={height}
        height={height}
        className={className}
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
      className={className}
      style={{ height, width: "auto" }}
      priority={priority}
    />
  )
}
