/**
 * Attribute value interface
 */
export interface AttributeValue {
  id: string
  value: string
  rank?: number
}

/**
 * Attribute interface
 */
export interface Attribute {
  id: string
  name: string
  handle: string
  description?: string
  is_filterable: boolean
  ui_component: string
  possible_values?: AttributeValue[]
}

/**
 * Product attribute with value interface
 */
export interface ProductAttributeValue {
  id: string
  value: string
  attribute_id: string
  attribute: {
    id: string
    name: string
    handle: string
    ui_component: string
  }
}

/**
 * Physical attribute interface for product dimensions
 */
export interface PhysicalAttribute {
  min: number
  max: number
  unit: string
}

/**
 * Default physical attribute ranges and units for fallback
 */
export const DEFAULT_PHYSICAL_ATTRIBUTES: Record<string, PhysicalAttribute> = {
  weight: { min: 0, max: 1000, unit: 'g' },
  length: { min: 0, max: 100, unit: 'cm' },
  height: { min: 0, max: 100, unit: 'cm' },
  width: { min: 0, max: 100, unit: 'cm' }
}
