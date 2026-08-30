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
        title: 'Quote requested',
        description: 'The supplier will respond with pricing and lead time.'
      });
      onClose();
    } catch (error) {
      toast.error({
        title: 'Could not send quote request',
        description: (error as Error).message
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal heading="Request a quote" onClose={onClose} data-testid="request-quote-modal">
      <form onSubmit={handleSubmit(submit)} className="px-4 space-y-4" data-testid="request-quote-form">
        <p className="label-md text-secondary">
          Ask this supplier for a volume price, MOQ, and delivery window. Your company
          profile is included with the request.
        </p>
        <LabeledInput
          label="Quantity"
          type="number"
          min={1}
          error={errors.quantity as FieldError}
          data-testid="quote-quantity-input"
          {...register('quantity')}
        />
        <LabeledInput
          label="Needed by (optional)"
          placeholder="e.g. 30 days, Q4 2026"
          error={errors.target_delivery as FieldError}
          data-testid="quote-delivery-input"
          {...register('target_delivery')}
        />
        <label className="label-sm block">
          <p>Notes for the supplier</p>
          <Textarea
            rows={4}
            placeholder="Specs, packaging, Incoterms, payment terms…"
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
          Send request
        </Button>
      </form>
    </Modal>
  );
};
