'use client';

import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FieldError, FieldValues, FormProvider, useForm, useFormContext } from 'react-hook-form';

import { Button } from '@/components/atoms';
import { Alert } from '@/components/atoms/Alert/Alert';
import { LabeledInput } from '@/components/cells';
import { login, transferCart } from '@/lib/data/customer';
import { toast } from '@/lib/helpers/toast';

import { LoginFormData, loginFormSchema } from './schema';
import { resolveLoginSubmit } from './login-submit';
import { useCopy } from '@/lib/i18n/useCopy';

export const LoginForm = () => {
  const methods = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  return (
    <FormProvider {...methods}>
      <Form />
    </FormProvider>
  );
};

const Form = () => {
  const t = useCopy();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting }
  } = useFormContext();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSessionExpired = searchParams.get('sessionExpired') === 'true';
  const isSessionRequired = searchParams.get('sessionRequired') === 'true';

  const submit = async (data: FieldValues) => {
    const formData = new FormData();
    formData.append('email', data.email);
    formData.append('password', data.password);

    const res = await login(formData);
    const outcome = resolveLoginSubmit(res, t.genericError);

    if (outcome.type === 'continue') {
      setSubmitError(null);
      router.push(outcome.href);
      try {
        await transferCart();
      } catch {
        // Session is already stored. Cart merge should not block entry.
      }
      return;
    }

    setSubmitError(outcome.message);
    toast.error({ title: outcome.message });
  };

  const clearApiError = () => {
    if (!submitError) return;
    setSubmitError(null);
  };

  const getAuthMessage = () => {
    if (submitError) {
      return submitError;
    }
    if (isSessionExpired) {
      return t.sessionExpired;
    }
    if (isSessionRequired) {
      return t.sessionRequired;
    }
    return null;
  };

  const authMessage = getAuthMessage();

  return (
    <main
      className="container"
      data-testid="login-page"
    >
      <div className="mx-auto mt-6 w-full max-w-xl space-y-4">
        {authMessage && (
          <Alert
            title={authMessage}
            className="w-full"
            icon
            data-testid="login-auth-alert"
          />
        )}
        <div
          className="rounded-sm border p-4"
          data-testid="login-form-container"
        >
          <h1 className="heading-md mb-8 uppercase text-primary">{t.loginTitle}</h1>
          <form
            onSubmit={handleSubmit(submit)}
            data-testid="login-form"
          >
            <div className="space-y-4">
              <LabeledInput
                label={t.emailLabel}
                placeholder={t.emailPlaceholder}
                error={errors.email as FieldError}
                data-testid="login-email-input"
                {...register('email', {
                  onChange: clearApiError
                })}
              />
              <LabeledInput
                label={t.passwordLabel}
                placeholder={t.passwordPlaceholder}
                type="password"
                error={
                  (errors.password as FieldError) ||
                  (submitError ? ({ message: submitError } as FieldError) : undefined)
                }
                data-testid="login-password-input"
                {...register('password', {
                  onChange: clearApiError
                })}
              />
            </div>

            <Link
              href="/forgot-password"
              className="label-md mt-4 block text-end uppercase text-action-on-secondary"
              data-testid="login-forgot-password-link"
            >
              {t.forgotPassword}
            </Link>

            <Button
              className="mt-8 w-full uppercase"
              disabled={isSubmitting}
              data-testid="login-submit-button"
            >
              {t.login}
            </Button>
          </form>
        </div>

        <div className="rounded-sm border p-4">
          <h2 className="heading-md mb-4 uppercase text-primary">
            {t.needBuyer}
          </h2>
          <Link
            href="/register"
            data-testid="login-register-link"
          >
            <Button
              variant="tonal"
              className="mt-8 flex w-full justify-center uppercase"
            >
              {t.createBuyerAccount}
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
};
