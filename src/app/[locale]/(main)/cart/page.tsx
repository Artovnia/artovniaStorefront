import { Cart } from '@/components/sections';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Koszyk - Artovnia',
  description: 'Twój koszyk zakupowy',
};

export default function CartPage({}) {
  return (
    <main className='container grid grid-cols-12'>
      <Cart />
    </main>
  );
}
