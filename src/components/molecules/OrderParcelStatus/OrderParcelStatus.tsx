// F:\StronyInternetowe\mercur\ArtovniaStorefront\src\components\molecules\OrderParcelStatus\OrderParcelStatus.tsx
import { StepProgressBar } from "@/components/cells/StepProgressBar/StepProgressBar"
import { parcelStatuses, steps } from "@/lib/helpers/parcel-statuses"

export const OrderParcelStatus = ({ order }: { order: any }) => {
  
  // CRITICAL FIX: Use pre-calculated status from enriched order object
  // If statusRealizacji and aktualnyKrok are already calculated, use them
  const statusRealizacji = order.statusRealizacji
  const aktualnyKrok = order.aktualnyKrok
  

  // Fallback: If not pre-calculated, calculate here (shouldn't happen with new flow)
  let finalStatusRealizacji = statusRealizacji
  let finalAktualnyKrok = aktualnyKrok
  
  if (!statusRealizacji || aktualnyKrok === undefined) {
    
    const realizacje = order.fulfillments || []
    let najbardziejZaawansowanyStatus = "not_fulfilled"
    
    if (realizacje.length === 0) {
      switch (order.status) {
        case "completed":
          najbardziejZaawansowanyStatus = "delivered"
          break
        case "canceled":
          najbardziejZaawansowanyStatus = "canceled"
          break
        case "pending":
        default:
          najbardziejZaawansowanyStatus = "not_fulfilled"
      }
    } else {
      for (const realizacja of realizacje) {
        if (realizacja.canceled_at) {
          najbardziejZaawansowanyStatus = "canceled"
          break
        }
        if (realizacja.delivered_at) {
          najbardziejZaawansowanyStatus = "delivered"
          continue
        }
        if (realizacja.shipped_at && najbardziejZaawansowanyStatus === "not_fulfilled") {
          najbardziejZaawansowanyStatus = "shipped"
          continue
        }
        if (realizacja.packed_at && najbardziejZaawansowanyStatus === "not_fulfilled") {
          najbardziejZaawansowanyStatus = "prepared"
          continue
        }
        if (najbardziejZaawansowanyStatus === "not_fulfilled") {
          najbardziejZaawansowanyStatus = "fulfilled"
        }
      }
    }
    
    finalStatusRealizacji = najbardziejZaawansowanyStatus
    finalAktualnyKrok = parcelStatuses(najbardziejZaawansowanyStatus)
  }


  return (
    <div>
      <StepProgressBar steps={steps} currentStep={finalAktualnyKrok} />
    </div>
  )
}