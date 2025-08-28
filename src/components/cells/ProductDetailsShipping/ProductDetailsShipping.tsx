import { ProductPageAccordion } from '@/components/molecules';

export const ProductDetailsShipping = () => {
  return (
    <ProductPageAccordion
      heading='Dostawa & Zwroty'
      defaultOpen={false}
    >
      <div className='product-details'>
        <p>
          Zgodnie z obowiązującym prawem, każdy sprzedawca ma obowiązek umożliwić klientowi zwrot towaru w terminie 14 dni od otrzymania przesyłki, z wyjątkiem produktów wykonywanych na zamówienie lub personalizowanych. Sprzedawca musi:
        </p>
        <ul className="mt-2">
          <li>udostępnić adres do zwrotów (może się różnić od adresu kontaktowego),</li>
          <li>obsługiwać zwroty i reklamacje zgodnie z ustawą o prawach konsumenta,</li>
          <li>udostępnić klientowi formularz zwrotu (lub przyjąć go przez panel klienta).</li>
        </ul>
        <p className="mt-2">
          Reklamacje są rozpatrywane bezpośrednio między klientem a sprzedawcą.
        </p>
      </div>
    </ProductPageAccordion>
  );
};
