// F:\StronyInternetowe\mercur\ArtovniaStorefront\src\lib\helpers\parcel-statuses.ts
export const steps = ["Zamówienie otrzymane", "W Przygotowaniu", "Wysłano", "Dostarczono"]

export const parcelStatuses = (
  status: string | undefined
) => {
  console.log('Status paczki - dane wejściowe:', status)
  
  switch (status) {
    case "not_fulfilled":
    case "pending":
      return 0 // Przyjęto
    case "fulfilled":
    case "partially_fulfilled":
    case "processing":
      return 1 // Przygotowano
    case "shipped":
    case "partially_shipped":
      return 2 // Wysłano
    case "delivered":
    case "partially_delivered":
    case "completed":  // Dodano, ponieważ order.status używa "completed"
      return 3 // Dostarczono
    case "canceled":
      return 0 // W przypadku anulowania, pokazujemy jako "Przyjęto"
    default:
      console.log('Nieznany status realizacji:', status)
      return 0
  }
}