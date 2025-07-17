import React from 'react'
import { CheckCircleSolid as MedusaCheckCircleSolid } from '@medusajs/icons'

// Properly type the component using the same props as the original icon component
type IconProps = React.ComponentProps<typeof MedusaCheckCircleSolid>

export const CheckCircleSolidFixed = React.forwardRef<SVGSVGElement, IconProps>((props, ref) => {
  // Only pass through the props that the original component expects
  return <MedusaCheckCircleSolid ref={ref} {...props} />
})

CheckCircleSolidFixed.displayName = 'CheckCircleSolidFixed'

export default CheckCircleSolidFixed
