import { redirect } from "next/navigation"

import { JOIN_AS_SELLER_PATH } from "@/lib/helpers/locale-path"

export default function SellerLandingRedirect() {
  redirect(JOIN_AS_SELLER_PATH)
}
