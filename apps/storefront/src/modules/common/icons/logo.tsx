import { IconProps } from "@/types/icon"
import Image from "next/image"

const LogoIcon: React.FC<IconProps> = ({ className, size = 28 }) => {
  const dimension = typeof size === "string" ? parseInt(size, 10) || 28 : size

  return (
    <Image
      src="/tradnest-icon.png"
      alt="Tradnest"
      width={dimension}
      height={dimension}
      className={className}
    />
  )
}

export default LogoIcon
