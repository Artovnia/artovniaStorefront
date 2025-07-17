// F:\StronyInternetowe\mercur\ArtovniaStorefront\src\components\molecules\OrderParcelStatus\OrderParcelStatus.tsx
import { StepProgressBar } from "@/components/cells/StepProgressBar/StepProgressBar"
import { parcelStatuses, steps } from "@/lib/helpers/parcel-statuses"

export const OrderParcelStatus = ({ order }: { order: any }) => {
  console.log('StatusPaczki - pełne dane zamówienia:', JSON.stringify(order, null, 2))
  
  console.log('StatusPaczki - realizacje zamówienia:', {
    id: order.id,
    status: order.status,
    status_realizacji: order.fulfillment_status,
    realizacje: order.fulfillments,
    liczba_realizacji: order.fulfillments?.length || 0,
    szczegóły_realizacji: order.fulfillments?.map((f: any) => ({
      id: f.id,
      spakowano_o: f.packed_at,
      wysłano_o: f.shipped_at,
      dostarczono_o: f.delivered_at,
      anulowano_o: f.canceled_at,
      wszystkie_klucze: Object.keys(f)
    }))
  })

  // Pobierz status realizacji na podstawie znaczników czasu realizacji
  const getFulfillmentStatus = (order: any) => {
    const realizacje = order.fulfillments || []
    
    console.log('pobierzStatusRealizacji - analiza realizacji:', {
      liczba_realizacji: realizacje.length,
      status_zamówienia: order.status,
      status_realizacji_zamówienia: order.fulfillment_status
    })
    
    // Jeśli nie ma realizacji, sprawdź status zamówienia
    if (realizacje.length === 0) {
      console.log('Nie znaleziono realizacji, używanie statusu zamówienia jako zapasowego')
      switch (order.status) {
        case "completed":
          return "delivered"
        case "canceled":
          return "canceled"
        case "pending":
        default:
          return "not_fulfilled"
      }
    }
    
    // Sprawdź wszystkie realizacje, aby znaleźć najbardziej zaawansowany status
    let najbardziejZaawansowanyStatus = "not_fulfilled"
    
    for (const realizacja of realizacje) {
      console.log('Sprawdzanie realizacji:', {
        id: realizacja.id,
        spakowano_o: realizacja.packed_at,
        wysłano_o: realizacja.shipped_at,
        dostarczono_o: realizacja.delivered_at,
        anulowano_o: realizacja.canceled_at
      })
      
      if (realizacja.canceled_at) {
        console.log('Znaleziono anulowana realizację')
        return "canceled"
      }
      
      if (realizacja.delivered_at) {
        console.log('Znaleziono dostarczoną realizację')
        najbardziejZaawansowanyStatus = "delivered"
        continue
      }
      
      if (realizacja.shipped_at) {
        console.log('Znaleziono wysłaną realizację')
        if (najbardziejZaawansowanyStatus === "not_fulfilled") {
          najbardziejZaawansowanyStatus = "shipped"
        }
        continue
      }
      
      if (realizacja.packed_at) {
        console.log('Znaleziono spakowaną realizację')
        if (najbardziejZaawansowanyStatus === "not_fulfilled") {
          najbardziejZaawansowanyStatus = "prepared"
        }
        continue
      }
      
      // Jeśli realizacja istnieje, ale nie ma konkretnych znaczników czasu, to jest co najmniej zrealizowana
      if (najbardziejZaawansowanyStatus === "not_fulfilled") {
        console.log('Znaleziono podstawową realizację bez znaczników czasu')
        najbardziejZaawansowanyStatus = "fulfilled"
      }
    }
    
    console.log('Najbardziej zaawansowany status określony:', najbardziejZaawansowanyStatus)
    return najbardziejZaawansowanyStatus
  }

  const statusRealizacji = getFulfillmentStatus(order)
  const aktualnyKrok = parcelStatuses(statusRealizacji)

  console.log('StatusPaczki - OSTATECZNY obliczony krok:', {
    status_zamówienia: order.status,
    statusRealizacji,
    aktualnyKrok,
    ma_realizacje: (order.fulfillments?.length || 0) > 0
  })

  return (
    <div>
      <StepProgressBar steps={steps} currentStep={aktualnyKrok} />
    </div>
  )
}