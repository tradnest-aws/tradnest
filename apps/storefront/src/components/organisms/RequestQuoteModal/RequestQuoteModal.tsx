'use client';

import { useState } from 'react';
import { FieldError, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { HttpTypes } from '@medusajs/types';

import { Button } from '@/components/atoms';
import { LabeledInput } from '@/components/cells';
import { Textarea } from '@/components/atoms/Textarea/Textarea';
import { Modal } from '@/components/molecules/Modal/Modal';
import { createQuoteRequest } from '@/lib/data/quotes';
import { readBuyerAccount } from '@/lib/helpers/buyer-account';
import { toast } from '@/lib/helpers/toast';
import { useCopy } from '@/lib/i18n/useCopy';

const schema = z.object({
  quantity: z.coerce.number().int().min(1, 'Enter a quantity of at least 1'),
  target_delivery: z.string().optional(),
  message: z.string().max(2000).optional()
});

type FormData = z.infer<typeof schema>;

export const RequestQuoteModal = ({
  productId,
  productTitle,
  sellerId,
  offerId,
  variantId,
  user,
  onClose
}: {
  productId: string;
  productTitle: string;
  sellerId: string;
  offerId?: string | null;
  variantId?: string | null;
  user: HttpTypes.StoreCustomer;
  onClose: () => void;
}) => {
  const t = useCopy();
  const account = readBuyerAccount(user);
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      quantity: 10,
      target_delivery: '',
      message: ''
    }
  });

  const submit = async (data: FormData) => {
    setSubmitting(true);
    try {
      await createQuoteRequest({
        seller_id: sellerId,
        product_id: productId,
        product_title: productTitle,
        offer_id: offerId,
        variant_id: variantId,
        quantity: data.quantity,
        target_delivery: data.target_delivery || null,
        message: data.message || null,
        company_name: account.company_name || null
      });
      toast.success({
        title: t.quoteRequested,
        description: t.quoteRequestedHint
      });
      onClose();
    } catch (error) {
      toast.error({
        title: t.quoteFailed,
        description: (error as Error).message
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal heading={t.requestQuoteHeading} onClose={onClose} data-testid="request-quote-modal">
      <form onSubmit={handleSubmit(submit)} className="px-4 space-y-4" data-testid="request-quote-form">
        <p className="label-md text-secondary">
          {t.requestQuoteHint}
        </p>
        <LabeledInput
          label={t.quantity}
          type="number"
          min={1}
          error={errors.quantity as FieldError}
          data-testid="quote-quantity-input"
          {...register('quantity')}
        />
        <LabeledInput
          label={t.neededBy}
          placeholder={t.neededByPlaceholder}
          error={errors.target_delivery as FieldError}
          data-testid="quote-delivery-input"
          {...register('target_delivery')}
        />
        <label className="label-sm block">
          <p>{t.notesForSupplier}</p>
          <Textarea
            rows={4}
            placeholder={t.notesPlaceholder}
            data-testid="quote-message-input"
            {...register('message')}
          />
        </label>
        <Button
          className="w-full uppercase"
          loading={submitting}
          disabled={submitting}
          data-testid="quote-submit-button"
        >
          {t.sendRequest}
        </Button>
      </form>
    </Modal>
  );
};
