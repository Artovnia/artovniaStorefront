import { Card, Checkbox } from "@/components/atoms"

export const ReturnMethodsTab = ({
  shippingMethods,
  handleSetReturnMethod,
  returnMethod,
  seller,
}: {
  shippingMethods: any
  handleSetReturnMethod: (method: any) => void
  returnMethod: string
  seller: any
}) => {
  const noShippingMethods = !shippingMethods?.length || false


  return (
    <>
      <div className="mb-8">
        <Card className="bg-secondary p-4">
          <p className="label-lg uppercase">Metody zwrotu</p>
        </Card>
        <Card className="flex items-center justify-between p-4">
          {noShippingMethods ? (
            <div className="py-4 text-center font-bold heading-md w-full">
              Brak dostępnych metod zwrotu
            </div>
          ) : (
            <ul>
              {shippingMethods.map((method: any) => (
                <li
                  key={method.id}
                  className="flex items-center gap-4 my-2 cursor-pointer"
                >
                  <Checkbox 
                    checked={returnMethod === method.id}
                    onChange={() => handleSetReturnMethod(method.id)}
                  />
                  <span className="label-lg" onClick={() => handleSetReturnMethod(method.id)}>
                    {method.name === 'customer-shipping' ? 'Wysyłka przez klienta' : method.name}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
      {seller && (
        <div>
          <Card className="bg-secondary p-4">
            <p className="label-lg uppercase">Adres zwrotu</p>
          </Card>
          <Card className="p-4">
            {seller.name && <p className="label-lg mb-2">{seller.name}</p>}
            
            {/* Show address if available */}
            {(seller.address_line || seller.city || seller.postal_code) ? (
              <>
                {seller.address_line && <p className="label-md">{seller.address_line}</p>}
                {(seller.city || seller.state) && (
                  <p className="label-md">
                    {[seller.city, seller.state].filter(Boolean).join(', ')}
                  </p>
                )}
                {(seller.postal_code || seller.country_code) && (
                  <p className="label-md">
                    {[seller.postal_code, seller.country_code].filter(Boolean).join(', ')}
                  </p>
                )}
                {(seller.email || seller.phone) && (
                  <p className="label-md mt-2">
                    {[seller.email, seller.phone].filter(Boolean).join(', ')}
                  </p>
                )}
              </>
            ) : (
              <div className="text-secondary">
                <p className="label-md mb-2">
                  Sprzedawca nie podał jeszcze adresu zwrotu.
                </p>
                <p className="label-sm">
                  Skontaktuj się ze sprzedawcą, aby uzyskać adres zwrotu.
                </p>
                {(seller.email || seller.phone) && (
                  <p className="label-md mt-2 text-primary">
                    Kontakt: {[seller.email, seller.phone].filter(Boolean).join(', ')}
                  </p>
                )}
              </div>
            )}
          </Card>
        </div>
      )}
    </>
  )
}
