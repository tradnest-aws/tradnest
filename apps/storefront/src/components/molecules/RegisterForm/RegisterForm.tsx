"use client"
import {
  FieldError,
  FormProvider,
  useForm,
  useFormContext,
} from "react-hook-form"
import { Button } from "@/components/atoms"
import { zodResolver } from "@hookform/resolvers/zod"
import { LabeledInput } from "@/components/cells"
import { registerFormSchema, RegisterFormData } from "./schema"
import { signup } from "@/lib/data/customer"
import { useState } from "react"
import { Container } from "@medusajs/ui"
import Link from "next/link"
import { PasswordValidator } from "@/components/cells/PasswordValidator/PasswordValidator"
import { toast } from "@/lib/helpers/toast"
import { useRouter } from "next/navigation"
import { useCopy } from "@/lib/i18n/useCopy"

export const RegisterForm = () => {
  const methods = useForm<RegisterFormData>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      password: "",
      companyName: "",
      jobTitle: "",
      taxId: "",
    },
  })

  return (
    <FormProvider {...methods}>
      <Form />
    </FormProvider>
  )
}

const Form = () => {
  const t = useCopy()
  const [passwordError, setPasswordError] = useState({
    isValid: false,
    lower: false,
    upper: false,
    "8chars": false,
    symbolOrDigit: false,
  })

  const {
    handleSubmit,
    register,
    watch,
    formState: { errors, isSubmitting },
  } = useFormContext<RegisterFormData>()
  const router = useRouter()

  const submit = async (data: RegisterFormData) => {
    if (!passwordError.isValid) {
      return
    }

    const formData = new FormData()
    formData.append("email", data.email)
    formData.append("password", data.password)
    formData.append("first_name", data.firstName)
    formData.append("last_name", data.lastName)
    formData.append("phone", data.phone)
    formData.append("company_name", data.companyName)
    formData.append("job_title", data.jobTitle || "")
    formData.append("tax_id", data.taxId || "")

    const res = await signup(formData)

    if (res && typeof res === "object" && "id" in res && res.id) {
      router.push("/user")
      return
    }

    if (res && !res?.id) {

      // Temporary solution. Check also for status code when it's fixed by backend
      const errorMessage = String(res).toLowerCase().includes('error: identity with email already exists') ? t.emailExists : String(res)
      toast.error({ title: errorMessage})
    }
  }

  return (
    <main className="container" data-testid="register-page">
      <Container className="border max-w-xl mx-auto mt-8 p-4" data-testid="register-form-container">
        <h1 className="heading-md text-primary uppercase mb-8">
          {t.registerTitle}
        </h1>
        <p className="label-md text-secondary mb-6">
          {t.registerHint}
        </p>
        <form onSubmit={handleSubmit(submit)} data-testid="register-form">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <LabeledInput
              className="md:w-1/2"
              label={t.firstName}
              placeholder={t.firstNamePlaceholder}
              error={errors.firstName as FieldError}
              data-testid="register-first-name-input"
              {...register("firstName")}
            />
            <LabeledInput
              className="md:w-1/2"
              label={t.lastName}
              placeholder={t.lastNamePlaceholder}
              error={errors.lastName as FieldError}
              data-testid="register-last-name-input"
              {...register("lastName")}
            />
          </div>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <LabeledInput
              className="md:w-1/2"
              label={t.companyName}
              placeholder={t.companyPlaceholder}
              error={errors.companyName as FieldError}
              data-testid="register-company-name-input"
              {...register("companyName")}
            />
            <LabeledInput
              className="md:w-1/2"
              label={t.jobTitle}
              placeholder={t.jobPlaceholder}
              error={errors.jobTitle as FieldError}
              data-testid="register-job-title-input"
              {...register("jobTitle")}
            />
          </div>
          <LabeledInput
            className="mb-4"
            label={t.taxId}
            placeholder={t.optional}
            error={errors.taxId as FieldError}
            data-testid="register-tax-id-input"
            {...register("taxId")}
          />
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <LabeledInput
              className="md:w-1/2"
              label={t.emailLabel}
              placeholder={t.emailPlaceholder}
              error={errors.email as FieldError}
              data-testid="register-email-input"
              {...register("email")}
            />
            <LabeledInput
              className="md:w-1/2"
              label={t.phone}
              placeholder={t.phonePlaceholder}
              error={errors.phone as FieldError}
              data-testid="register-phone-input"
              {...register("phone")}
            />
          </div>
          <div>
            <LabeledInput
              className="mb-4"
              label={t.passwordLabel}
              placeholder={t.passwordPlaceholder}
              type="password"
              error={errors.password as FieldError}
              data-testid="register-password-input"
              {...register("password")}
            />
            <PasswordValidator
              password={watch("password")}
              setError={setPasswordError}
            />
          </div>

          <Button
            className="w-full flex justify-center mt-8 uppercase"
            disabled={isSubmitting}
            loading={isSubmitting}
            data-testid="register-submit-button"
          >
            {t.createBuyerAccount}
          </Button>
        </form>
      </Container>
      <Container className="border max-w-xl mx-auto mt-8 p-4">
        <h2 className="heading-md text-primary uppercase mb-8">
          {t.alreadyHaveAccount}
        </h2>
        <Link href="/login" data-testid="register-login-link">
          <Button
            variant="tonal"
            className="w-full flex justify-center mt-8 uppercase"
          >
            {t.login}
          </Button>
        </Link>
      </Container>
    </main>
  )
}
