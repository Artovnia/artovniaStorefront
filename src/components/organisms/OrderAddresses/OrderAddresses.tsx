import { Card } from "@/components/atoms"

type AddressProps = {
  first_name?: string;
  last_name?: string;
  address_1?: string;
  address_2?: string;
  city?: string;
  postal_code?: string;
  province?: string;
  country?: string;
  phone?: string;
};

interface OrderAddressesProps {
  shipping_address?: AddressProps;
  billing_address?: AddressProps;
}

export const OrderAddresses = ({ shipping_address }: OrderAddressesProps) => {
  // If no shipping address is provided, don't render anything
  if (!shipping_address) return null;

  return (
    <Card className="p-6 mt-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="heading-sm uppercase">Adres wysyłki</h3>
      </div>
      
      <div className="text-md">
        <p className="font-semibold">
          {shipping_address.first_name} {shipping_address.last_name}
        </p>
        <p>{shipping_address.address_1}</p>
        {shipping_address.address_2 && <p>{shipping_address.address_2}</p>}
        <p>
          {shipping_address.postal_code} {shipping_address.city}{shipping_address.province ? `, ${shipping_address.province}` : ''}
        </p>
        <p>{shipping_address.country}</p>
        {shipping_address.phone && <p className="mt-2">{shipping_address.phone}</p>}
      </div>
    </Card>
  )
}
