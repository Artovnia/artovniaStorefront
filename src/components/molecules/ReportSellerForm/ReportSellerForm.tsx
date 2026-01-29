'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Textarea } from '@/components/atoms';
import { SelectField } from '../SelectField/SelectField';
import { cn } from '@/lib/utils';

const reasonOptions = [
  { label: '', value: '', hidden: true },
  {
    label: 'Naruszenie znaku towarowego, praw autorskich lub DMCA',
    value: 'trademark_copyright_violation',
  },
  {
    label: 'Podrobione lub nieautentyczne produkty',
    value: 'counterfeit_products',
  },
  {
    label: 'Oszustwo lub wprowadzające w błąd informacje',
    value: 'fraud_misleading',
  },
  {
    label: 'Nieodpowiednie lub obraźliwe treści',
    value: 'inappropriate_content',
  },
  {
    label: 'Naruszenie regulaminu platformy',
    value: 'platform_policy_violation',
  },
  {
    label: 'Sprzedaż zabronionych przedmiotów',
    value: 'prohibited_items',
  },
  {
    label: 'Podejrzana lub nielegalna działalność',
    value: 'suspicious_illegal_activity',
  },
  {
    label: 'Molestowanie lub niewłaściwe zachowanie',
    value: 'harassment_misconduct',
  },
  {
    label: 'Inne',
    value: 'other',
  },
];

const formSchema = z.object({
  reason: z.string().nonempty('Proszę wybrać powód'),
  comment: z.string().nonempty('Proszę dodać komentarz'),
});

type FormData = z.infer<typeof formSchema>;

export const ReportSellerForm = ({
  seller_id,
  onClose,
}: {
  seller_id: string;
  onClose: () => void;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitted },
    setValue,
    clearErrors,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reason: '',
      comment: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/reports/seller`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || '',
        },
        body: JSON.stringify({
          seller_id,
          reason: data.reason,
          comment: data.comment,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit report');
      }

      const result = await response.json();
      console.log('✅ Report submitted successfully:', result);
    } catch (error) {
      console.error('❌ Error submitting report:', error);
      alert('Nie udało się wysłać zgłoszenia. Spróbuj ponownie.');
    }
  };

  return (
    <div>
      {!isSubmitted ? (
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className='px-4 pb-5 z-999'>
            <label className='label-sm'>
              <p
                className={cn(
                  errors?.reason && 'text-negative'
                )}
              >
                Powód
              </p>
              <SelectField
                options={reasonOptions}
                {...register('reason')}
                selectOption={(value) => {
                  setValue('reason', value);
                  clearErrors('reason');
                }}
                className={cn(
                  errors?.reason && 'border-negative'
                )}
              />
              {errors?.reason && (
                <p className='label-sm text-negative'>
                  {errors.reason.message}
                </p>
              )}
            </label>

            <label className='label-sm'>
              <p
                className={cn(
                  'mt-5',
                  errors?.comment && 'text-negative'
                )}
              >
                Komentarz
              </p>
              <Textarea
                rows={5}
                {...register('comment')}
                className={cn(
                  errors.comment && 'border-negative'
                )}
              />
              {errors?.comment && (
                <p className='label-sm text-negative'>
                  {errors.comment.message}
                </p>
              )}
            </label>
          </div>

          <div className='border-t px-4 pt-5'>
            <Button
              type='submit'
              className='w-full py-3 uppercase'
            >
              Zgłoś sprzedawcę
            </Button>
          </div>
        </form>
      ) : (
        <div className='text-center'>
          <div className='px-4 pb-5'>
            <h4 className='heading-lg uppercase'>
              Dziękujemy!
            </h4>
            <p className='max-w-[466px] mx-auto mt-4 text-lg text-secondary'>
              Sprawdzimy ofertę, aby upewnić się, że
              przestrzega naszych wytycznych i podjęliśmy
              niezbędne działania, aby zapewnić bezpieczne
              doświadczenie zakupowe
              dla wszystkich. Dziękujemy za pomoc w utrzymaniu
              zaufanej społeczności.
            </p>
          </div>

          <div className='border-t px-4 pt-5'>
            <Button
              className='w-full py-3 uppercase'
              onClick={onClose}
            >
              Rozumiem
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
