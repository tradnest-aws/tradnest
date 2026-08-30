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
      const errorMessage = String(res).toLowerCase().includes('error: identity with email already exists') ? 'It seems the email you entered is already associated with another account. Please log in instead.' : String(res)
      toast.error({ title: errorMessage})
    }
  }

  return (
    <main className="container" data-testid="register-page">
      <Container className="border max-w-xl mx-auto mt-8 p-4" data-testid="register-form-container">
        <h1 className="heading-md text-primary uppercase mb-8">
          Create a buyer account
        </h1>
        <p className="label-md text-secondary mb-6">
          Tradnest is a B2B marketplace. Register with your company so suppliers can quote you.
        </p>
        <form onSubmit={handleSubmit(submit)} data-testid="register-form">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <LabeledInput
              className="md:w-1/2"
              label="First name"
              placeholder="Your first name"
              error={errors.firstName as FieldError}
              data-testid="register-first-name-input"
              {...register("firstName")}
            />
            <LabeledInput
              className="md:w-1/2"
              label="Last name"
              placeholder="Your last name"
              error={errors.lastName as FieldError}
              data-testid="register-last-name-input"
              {...register("lastName")}
            />
          </div>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <LabeledInput
              className="md:w-1/2"
              label="Company name"
              placeholder="Legal company name"
              error={errors.companyName as FieldError}
              data-testid="register-company-name-input"
              {...register("companyName")}
            />
            <LabeledInput
              className="md:w-1/2"
              label="Job title"
              placeholder="Procurement, operations…"
              error={errors.jobTitle as FieldError}
              data-testid="register-job-title-input"
              {...register("jobTitle")}
            />
          </div>
          <LabeledInput
            className="mb-4"
            label="VAT / tax ID"
            placeholder="Optional"
            error={errors.taxId as FieldError}
            data-testid="register-tax-id-input"
            {...register("taxId")}
          />
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <LabeledInput
              className="md:w-1/2"
              label="E-mail"
              placeholder="Your e-mail address"
              error={errors.email as FieldError}
              data-testid="register-email-input"
              {...register("email")}
            />
            <LabeledInput
              className="md:w-1/2"
              label="Phone"
              placeholder="Your phone number"
              error={errors.phone as FieldError}
              data-testid="register-phone-input"
              {...register("phone")}
            />
          </div>
          <div>
            <LabeledInput
              className="mb-4"
              label="Password"
              placeholder="Your password"
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
            Create buyer account
          </Button>
        </form>
      </Container>
      <Container className="border max-w-xl mx-auto mt-8 p-4">
        <h2 className="heading-md text-primary uppercase mb-8">
          Already have an account?
        </h2>
        <Link href="/login" data-testid="register-login-link">
          <Button
            variant="tonal"
            className="w-full flex justify-center mt-8 uppercase"
          >
            Log in
          </Button>
        </Link>
      </Container>
    </main>
  )
}
