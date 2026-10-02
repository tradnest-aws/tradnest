import { ReactNode } from "react"
import { Trans, useTranslation } from "react-i18next"
import { Link } from "react-router-dom"

type AuthSwitchLinkProps = {
  i18nKey: string
  to: string
  linkKey?: string
}

export const AuthSwitchLink = ({
  i18nKey,
  to,
  linkKey = "auth-switch-link",
}: AuthSwitchLinkProps) => {
  const { t } = useTranslation()

  return (
    <p className="txt-compact-small auth-switch-copy">
      <Trans
        t={t}
        i18nKey={i18nKey}
        components={[<Link key={linkKey} to={to} />]}
      />
    </p>
  )
}

export const AuthSwitchStack = ({ children }: { children: ReactNode }) => {
  return <div className="mt-6 flex flex-col gap-y-2">{children}</div>
}
