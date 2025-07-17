# InPost Parcel Selector Component

This component allows users to select an InPost parcel machine during checkout. It provides both map and list views for selecting a parcel machine.

## Configuration

The component requires the following environment variables:

```env
NEXT_SHIPX_API_TOKEN=your_shipx_api_token
NEXT_GEOWIDGET_TOKEN=your_geowidget_token
```

For development without valid API tokens, the component will automatically fall back to using mock data.

## Usage

```tsx
import { InpostParcelSelector } from "@/components/molecules";
import { InpostParcelData } from "@/lib/services/inpost-api";

// ...

<InpostParcelSelector 
  onSelect={(data: InpostParcelData) => {
    // Handle selected parcel data
  }}
  initialValue={existingParcelData} // Optional
/>
```

## Troubleshooting

If you encounter issues with the map not loading:

1. Ensure your environment variables are properly set
2. Check browser console for any errors related to the InPost Geowidget script
3. Make sure the modal has fully rendered before initializing the map

The component includes built-in fallbacks to handle missing API tokens by providing mock data for testing.
