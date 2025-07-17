import { SingleProductMeasurement } from '@/types/product';

export const ProdutMeasurementRow = ({
  measurement,
  variantName,
}: {
  measurement: SingleProductMeasurement;
  variantName?: string;
}) => {
  const { label, inches, cm, value, unit, variantId } = measurement;
  
  // Determine if this is a weight measurement or a dimension measurement
  const isWeightMeasurement = unit === 'kg';
  
  // Build variant label if needed
  const displayLabel = variantId && variantName ? `${label} (${variantName})` : label;
  
  if (isWeightMeasurement) {
    // Weight measurement display (kg)
    return (
      <div className='border rounded-sm grid grid-cols-2 text-center label-md'>
        <div className='border-r py-3'>{displayLabel}</div>
        <div className='py-3'>{value} {unit}</div>
      </div>
    );
  } else {
    // Standard dimension display (cm/inches)
    return (
      <div className='border rounded-sm grid grid-cols-3 text-center label-md'>
        <div className='border-r py-3'>{displayLabel}</div>
        <div className='border-r py-3'>{inches} in</div>
        <div className='py-3'>{cm} cm</div>
      </div>
    );
  }
};
