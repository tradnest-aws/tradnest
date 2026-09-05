import { Children, ReactNode, useState } from "react"

import { zodResolver } from "@hookform/resolvers/zod"
import { Button, Heading, Hint, Input, Text } from "@medusajs/ui"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import config from "virtual:mercur/config"
import * as z from "zod"

import { Form } from "@components/common/form"
import AvatarBox from "@components/common/logo-box/avatar-box"
import { AuthLayout } from "@components/layout/auth-layout"
import { AuthSwitchLink, AuthSwitchStack } from "@components/layout/auth-layout/auth-switch-link"
import { useSignUpWithEmailPass } from "@hooks/api"

import { RegisterSchema } from "./register-schema"

const REGISTER_DRAFT_KEY = "mercur_register_draft"

const RegisterLogo = () => {
  return <AvatarBox />
}

const RegisterHeader = () => {
  const { t } = useTranslation()

  return (
    <div className="mb-6 flex flex-col">
      <Heading>{t("register.title", { name: config.name ?? "Tradnest" })}</Heading>
      <Text size="small" className="text-ui-fg-subtle">
        {t("register.hint", { name: config.name ?? "Tradnest" })}
      </Text>
    </div>
  )
}

const RegisterForm = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      password: "",
    },
  })

  const { mutateAsync: signUp, isPending } = useSignUpWithEmailPass()

  const handleSubmit = form.handleSubmit(async ({ first_name, last_name, email, password }) => {
    setServerError(null)
    try {
      await signUp({ email, password })
      // Persist identity details for onboarding step that creates the seller member.
      // Backend emailpass register does not accept these fields directly today,
      // so they ride through sessionStorage and land on the member via onboarding.
      sessionStorage.setItem(
        REGISTER_DRAFT_KEY,
        JSON.stringify({ first_name, last_name, email }),
      )
      navigate("/onboarding", { state: { email, first_name, last_name } })
    } catch (error: any) {
      setServerError(error?.message || t("register.error"))
    }
  })

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="flex w-full flex-col gap-y-6">
        <div className="flex flex-col gap-y-4">
          <Form.Field
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t("register.firstName")}</Form.Label>
                <Form.Control>
                  <Input autoComplete="given-name" {...field} />
                </Form.Control>
                <Form.ErrorMessage />
              </Form.Item>
            )}
          />
          <Form.Field
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t("register.lastName")}</Form.Label>
                <Form.Control>
                  <Input autoComplete="family-name" {...field} />
                </Form.Control>
                <Form.ErrorMessage />
              </Form.Item>
            )}
          />
          <Form.Field
            control={form.control}
            name="email"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t("fields.email")}</Form.Label>
                <Form.Control>
                  <Input autoComplete="email" {...field} />
                </Form.Control>
                <Form.ErrorMessage />
              </Form.Item>
            )}
          />
          <Form.Field
            control={form.control}
            name="password"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t("fields.password")}</Form.Label>
                <Form.Control>
                  <Input
                    type="password"
                    autoComplete="new-password"
                    {...field}
                  />
                </Form.Control>
                <Form.Hint>{t("register.passwordHint")}</Form.Hint>
                <Form.ErrorMessage />
              </Form.Item>
            )}
          />
          {serverError && (
            <Hint className="inline-flex" variant="error">
              {serverError}
            </Hint>
          )}
        </div>
        <Button className="w-full" type="submit" isLoading={isPending}>
          {t("actions.continue")}
        </Button>
      </form>
    </Form>
  )
}

const RegisterFooter = () => {
  return (
    <AuthSwitchStack>
      <AuthSwitchLink
        i18nKey="register.alreadySeller"
        to="/login"
        linkKey="login-link"
      />
    </AuthSwitchStack>
  )
}

const Root = ({ children }: { children?: ReactNode }) => {
  return (
    <AuthLayout>
      {Children.count(children) > 0 ? (
        children
      ) : (
        <>
          <RegisterLogo />
          <div className="mt-6">
            <RegisterHeader />
            <RegisterForm />
          </div>
          <RegisterFooter />
        </>
      )}
    </AuthLayout>
  )
}

export const RegisterPage = Object.assign(Root, {
  Logo: RegisterLogo,
  Header: RegisterHeader,
  Form: RegisterForm,
  Footer: RegisterFooter,
})
