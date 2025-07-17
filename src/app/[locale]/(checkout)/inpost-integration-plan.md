# InPost Parcel Machine Selector Implementation Plan

## Current Workflow Analysis

1. **Checkout Flow Structure**:
   - First step: Address entry (`CartAddressSection`)
   - Second step: Shipping method selection (`CartShippingMethodsSection`)
   - Third step: Payment (`CartPaymentSection`)

2. **Shipping Method Selection**:
   - Users select shipping options from dropdown menus in `CartShippingMethodsSection`
   - The `setShippingMethod` function in `cart.ts` is called with `cartId` and `shippingMethodId`
   - The backend workflow `addSellerShippingMethodToCartWorkflow` supports additional `data` with shipping methods

3. **Integration Point**:
   - In the backend workflow, shipping methods accept a `data` parameter which can store custom metadata
   - This is exactly what we need for storing the InPost parcel machine details

## Implementation Plan

### 1. Create InPost Parcel Machine Selector Component

```typescript
// src/components/molecules/InpostParcelSelector/InpostParcelSelector.tsx
"use client"

import React, { useState } from "react"
import { Button } from "@/components/atoms"
import { Modal } from "@/components/molecules"

type InpostParcelSelectorProps = {
  onSelect: (parcelData: InpostParcelData) => void
  initialValue?: InpostParcelData | null
}

export type InpostParcelData = {
  machineId: string
  machineName: string
  machineAddress: string
  machinePostCode: string
  machineCity: string
}

export const InpostParcelSelector: React.FC<InpostParcelSelectorProps> = ({
  onSelect,
  initialValue
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedParcel, setSelectedParcel] = useState<InpostParcelData | null>(initialValue || null)
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<InpostParcelData[]>([])

  const handleSearch = async () => {
    // In a real implementation, this would call an API to get parcel machines
    // For now, let's use mock data
    const mockResults: InpostParcelData[] = [
      {
        machineId: "WAW01M",
        machineName: "Warszawa Centrum",
        machineAddress: "ul. Marszałkowska 10",
        machinePostCode: "00-001",
        machineCity: "Warszawa"
      },
      {
        machineId: "WAW02M",
        machineName: "Warszawa Mokotów",
        machineAddress: "ul. Puławska 25",
        machinePostCode: "02-515",
        machineCity: "Warszawa"
      }
    ]
    
    setSearchResults(mockResults.filter(machine => 
      machine.machineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      machine.machineAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
      machine.machineCity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      machine.machinePostCode.toLowerCase().includes(searchTerm.toLowerCase())
    ))
  }

  const handleSelect = (parcel: InpostParcelData) => {
    setSelectedParcel(parcel)
    onSelect(parcel)
    setIsModalOpen(false)
  }

  return (
    <div className="mt-4">
      {selectedParcel ? (
        <div className="border rounded-lg p-4">
          <p className="font-medium">{selectedParcel.machineName}</p>
          <p>{selectedParcel.machineAddress}</p>
          <p>{selectedParcel.machinePostCode} {selectedParcel.machineCity}</p>
          <Button 
            variant="secondary" 
            onClick={() => setIsModalOpen(true)}
            className="mt-2"
          >
            Zmień paczkomat
          </Button>
        </div>
      ) : (
        <Button 
          onClick={() => setIsModalOpen(true)}
          variant="secondary"
        >
          Wybierz paczkomat
        </Button>
      )}

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="p-4">
          <h2 className="text-xl font-medium mb-4">Wybierz paczkomat InPost</h2>
          <div className="flex mb-4">
            <input
              type="text"
              placeholder="Wyszukaj paczkomat (miasto, ulica, kod)"
              className="w-full border rounded-l-lg p-2"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button onClick={handleSearch} className="rounded-l-none">
              Szukaj
            </Button>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {searchResults.map((parcel) => (
              <div
                key={parcel.machineId}
                className="border rounded-lg p-3 mb-2 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSelect(parcel)}
              >
                <p className="font-medium">{parcel.machineName}</p>
                <p>{parcel.machineAddress}</p>
                <p>{parcel.machinePostCode} {parcel.machineCity}</p>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  )
}
```

### 2. Modify CartShippingMethodsSection to Include the Selector

```typescript
// Modified CartShippingMethodsSection.tsx
// Add InPost selector when "Inpost paczkomat" is selected

// First, let's add the import
import { InpostParcelSelector, InpostParcelData } from "@/components/molecules/InpostParcelSelector/InpostParcelSelector"

// Then modify the handleSetShippingMethod function to include parcel data
const handleSetShippingMethod = async (id: string | null, parcelData?: InpostParcelData) => {
  setIsLoadingPrices(true)
  setError(null)

  if (!id) {
    setIsLoadingPrices(false)
    return
  }

  await setShippingMethod({ 
    cartId: cart.id, 
    shippingMethodId: id,
    data: parcelData ? {
      inpostParcelMachine: parcelData
    } : undefined
  }).catch(
    (err) => {
      setError(err.message)
    }
  )

  setIsLoadingPrices(false)
}

// Add state for tracking selected shipping methods and parcel data
const [selectedShippingMethods, setSelectedShippingMethods] = useState<Record<string, string>>({})
const [parcelData, setParcelData] = useState<Record<string, InpostParcelData>>({})

// Modify the JSX to conditionally show the InPost selector
{groupedBySellerId[key].map((option: any) => {
  return (
    <option 
      key={option.id} 
      value={option.id}
      data-seller-id={key}
    >
      {option.name}
      {" - "}
      {/* Price rendering */}
    </option>
  )
})}

{/* Add this after the select dropdown */}
{selectedShippingMethods[key] && 
  groupedBySellerId[key].find((o: any) => o.id === selectedShippingMethods[key])?.name.includes("Inpost paczkomat") && (
  <InpostParcelSelector
    onSelect={(data) => {
      setParcelData({...parcelData, [key]: data})
      handleSetShippingMethod(selectedShippingMethods[key], data)
    }}
    initialValue={parcelData[key]}
  />
)}
```

### 3. Update the Cart Data Model to Include Parcel Machine Data

Update `setShippingMethod` in `cart.ts` to accept and pass parcel machine data:

```typescript
// Modified setShippingMethod in cart.ts
export async function setShippingMethod({
  cartId,
  shippingMethodId,
  data,
}: {
  cartId: string
  shippingMethodId: string
  data?: Record<string, any>
}) {
  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.client.fetch<{ cart: HttpTypes.StoreCart }>(
    `/store/carts/${cartId}/shipping-methods`,
    {
      method: "POST",
      headers,
      body: {
        option_id: shippingMethodId,
        data: data,  // Pass any additional data here
      },
    }
  )
}
```

### 4. Backend - Store and Retrieve Parcel Machine Data

The backend already supports storing additional data with shipping methods. We need to make sure this data is available when retrieving orders.

Let's ensure the `data` field is included when retrieving order details in the vendor and admin panels.

### 5. Update Cart Review to Show Parcel Machine Information

```typescript
// In CartReview component or wherever shipping info is displayed
// Add a section to display InPost parcel machine info if available

const parcelMachineData = cart.shipping_methods?.[0]?.data?.inpostParcelMachine

{parcelMachineData && (
  <div className="mt-2">
    <Text className="txt-small-plus text-ui-fg-base">Paczkomat InPost:</Text>
    <Text className="txt-small text-ui-fg-subtle">
      {parcelMachineData.machineName}, {parcelMachineData.machineAddress}, 
      {parcelMachineData.machinePostCode} {parcelMachineData.machineCity}
    </Text>
  </div>
)}
```

## Technical Design Details

1. **Data Flow**:
   - User selects "Inpost paczkomat" shipping option
   - InPost selector component appears
   - User selects a parcel machine
   - Data is sent to the backend via the `setShippingMethod` function
   - Backend stores this data in the shipping method's `data` field
   - Data is retrieved when viewing the order in admin/vendor panels

2. **Data Structure**:
   ```typescript
   type InpostParcelData = {
     machineId: string       // Machine identifier (e.g., "WAW123")
     machineName: string     // Machine name (e.g., "Warszawa Centrum")
     machineAddress: string  // Street address
     machinePostCode: string // Postal code
     machineCity: string     // City
   }
   ```

3. **Integration with InPost API** (future enhancement):
   - Replace mock data with actual API calls to InPost
   - Add map integration for visual parcel machine selection
   - Add geolocation to find nearest parcel machines

## Next Steps

1. Create the InpostParcelSelector component
2. Modify CartShippingMethodsSection to conditionally show the selector
3. Update setShippingMethod to pass parcel data
4. Test the implementation
5. Ensure parcel data is available in order details for vendors and admins
