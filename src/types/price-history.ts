export interface LowestPriceData {
  variant_id: string
  currency_code: string
  region_id?: string
  lowest_30d_amount: number | null
  current_amount?: number | null
  savings_amount?: number | null
  savings_percentage?: number | null
  period_days: number
  found_at?: string
}

export interface PriceTrendData {
  variant_id: string
  currency_code: string
  region_id?: string
  period_days: number
  price_trend: Array<{
    date: string
    amount: number
  }>
}

export interface ProductLowestPricesData {
  product_id: string
  currency_code: string
  region_id?: string
  period_days: number
  variants: Record<string, {
    lowest_amount: number | null
    current_amount?: number | null
    savings_amount?: number | null
    savings_percentage?: number | null
    found_at?: string
  }>
}
