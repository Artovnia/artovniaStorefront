// Use process.env directly for backend URL
const MEDUSA_BACKEND_URL = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"

/**
 * Get headers with the publishable API key required for Medusa API calls
 */
const getHeaders = () => {
  return {
    "Accept": "application/json",
    "Content-Type": "application/json",
    "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
  }
}

export type VendorAvailability = {
  available: boolean
  suspended: boolean
  onHoliday: boolean
  message: string | null
  status: 'active' | 'holiday' | 'suspended'
  suspension_expires_at: Date | null
}

export type VendorHolidayMode = {
  is_holiday_mode: boolean
  holiday_start_date: Date | null
  holiday_end_date: Date | null
  holiday_message: string | null
  auto_reactivate: boolean
  status: 'active' | 'holiday' | 'suspended'
}

export type VendorSuspension = {
  is_suspended: boolean
  suspension_reason: string | null
  suspended_at: Date | null
  suspension_expires_at: Date | null
  status: 'active' | 'holiday' | 'suspended'
  has_expired?: boolean
}

/**
 * Returns a default availability object that marks a vendor as available
 */
function getDefaultAvailability(): VendorAvailability {
  return {
    available: true,
    suspended: false,
    onHoliday: false,
    message: null,
    status: 'active' as 'active' | 'holiday' | 'suspended',
    suspension_expires_at: null
  }
}

/**
 * Fetches the general availability status of a vendor
 */
export async function getVendorAvailability(vendorId: string): Promise<VendorAvailability> {
  
  try {
    // First try to check if the vendor exists
    if (!vendorId || vendorId === 'undefined') {
      console.warn(`Invalid vendorId in getVendorAvailability: ${vendorId}`)
      return getDefaultAvailability()
    }
    
    const response = await fetch(
      `${MEDUSA_BACKEND_URL}/store/vendors/${vendorId}/availability`,
      {
        next: { revalidate: 3600 }, // Cache for 1 hour (ISR compatible)
        headers: getHeaders(),
        // Add timeout to avoid hanging requests
        signal: AbortSignal.timeout(10000) // 10 second timeout
      }
    )
    
    // If API returns an error code, return a default availability object instead of throwing
    if (!response.ok) {
      // 404 is expected for vendors without records - no need to log
      // 500 might happen during initial setup - handle gracefully
      if (response.status !== 404) {
      }
      return getDefaultAvailability()
    }
    
    // Get the response data
    const data = await response.json()
    
    // Ensure onHoliday is properly set based on status
    if (data.status === 'holiday') {
      data.onHoliday = true
    }
    
    // Parse date if it exists
    if (data.suspension_expires_at) {
      data.suspension_expires_at = new Date(data.suspension_expires_at)
    }
    
    return data
    
  } catch (error) {
    // Log error but don't throw
    console.error(`Error fetching vendor availability: ${error instanceof Error ? error.message : 'Unknown error'}`)
    return getDefaultAvailability()
  }
}

/**
 * Fetches detailed holiday mode information for a vendor
 */
export async function getVendorHolidayMode(vendorId: string): Promise<VendorHolidayMode> {
  // Validate vendorId - return safe fallback if not valid
  if (!vendorId || vendorId === 'undefined') {
    console.warn(`Invalid vendorId in getVendorHolidayMode: ${vendorId}`)
    return {
      is_holiday_mode: false,
      holiday_start_date: null,
      holiday_end_date: null,
      holiday_message: null,
      auto_reactivate: false,
      status: 'active' as 'active' | 'holiday' | 'suspended'
    }
  }
  
  try {
    const response = await fetch(
      `${MEDUSA_BACKEND_URL}/store/vendors/${vendorId}/holiday`,
      {
        next: { revalidate: 3600 }, // Cache for 1 hour (ISR compatible)
        headers: getHeaders(),
        signal: AbortSignal.timeout(15000) // Increased to 15s for slow systems
      }
    )
    if (!response.ok) {
      // 404 is expected for vendors without records - no need to log
      // 500 might happen during initial setup - handle gracefully
      if (response.status !== 404) {
        
      }
      // Return a default object for inactive holiday mode
      return {
        is_holiday_mode: false,
        holiday_start_date: null,
        holiday_end_date: null,
        holiday_message: null,
        auto_reactivate: false,
        status: 'active' as 'active' | 'holiday' | 'suspended'
      }
    }
    
    let data
    try {
      data = await response.json()
    } catch (error) {
      console.error(`Error parsing vendor holiday response: ${error instanceof Error ? error.message : 'Unknown error'}`)
      return {
        is_holiday_mode: false,
        holiday_start_date: null,
        holiday_end_date: null,
        holiday_message: null,
        auto_reactivate: false,
        status: 'active' as 'active' | 'holiday' | 'suspended'
      }
    }
    
  
  const now = new Date()
  
  // Parse dates if they exist
  if (data.holiday_start_date) {
    data.holiday_start_date = new Date(data.holiday_start_date)
  }
  
  if (data.holiday_end_date) {
    data.holiday_end_date = new Date(data.holiday_end_date)
  }
  
  if (data.is_holiday_mode) {
    if (data.holiday_start_date && data.holiday_end_date) {
      const isCurrentlyOnHoliday = now >= data.holiday_start_date && now <= data.holiday_end_date
    } else {
    }
  }
  
  return data
  } catch (error) {
    // Log error but don't throw
    console.error(`Error fetching vendor holiday mode: ${error instanceof Error ? error.message : 'Unknown error'}`)
    
    // Return safe fallback
    return {
      is_holiday_mode: false,
      holiday_start_date: null,
      holiday_end_date: null,
      holiday_message: null,
      auto_reactivate: false,
      status: 'active' as 'active' | 'holiday' | 'suspended'
    }
  }
}

/**
 * Fetches detailed suspension information for a vendor
 */
export async function getVendorSuspension(vendorId: string): Promise<VendorSuspension> {
  try {
    if (!vendorId || vendorId === 'undefined') {
      console.warn(`Invalid vendorId in getVendorSuspension: ${vendorId}`)
      return {
        is_suspended: false,
        suspension_reason: null,
        suspended_at: null,
        suspension_expires_at: null,
        status: 'active' as 'active' | 'holiday' | 'suspended',
        has_expired: false
      }
    }
    
    const response = await fetch(
      `${MEDUSA_BACKEND_URL}/store/vendors/${vendorId}/suspension`,
      {
        next: { revalidate: 3600 }, // Cache for 1 hour (ISR compatible)
        headers: getHeaders(),
        signal: AbortSignal.timeout(15000) // Increased to 15s for slow systems
      }
    )

    if (!response.ok) {
      // 404 is expected for vendors without records - no need to log
      // 500 might happen during initial setup - handle gracefully
      if (response.status !== 404) {
      }
      return {
        is_suspended: false,
        suspension_reason: null,
        suspended_at: null,
        suspension_expires_at: null,
        status: 'active' as 'active' | 'holiday' | 'suspended',
        has_expired: false
      }
    }
    
    let data
    try {
      data = await response.json()
    } catch (error) {
      console.error(`Error parsing vendor suspension response: ${error instanceof Error ? error.message : 'Unknown error'}`)
      return {
        is_suspended: false,
        suspension_reason: null,
        suspended_at: null,
        suspension_expires_at: null,
        status: 'active' as 'active' | 'holiday' | 'suspended',
        has_expired: false
      }
    }
    
    // Parse dates if they exist
    if (data.suspended_at) {
      data.suspended_at = new Date(data.suspended_at)
    }
    
    if (data.suspension_expires_at) {
      data.suspension_expires_at = new Date(data.suspension_expires_at)
      
      // Check if suspension has expired
      data.has_expired = data.suspension_expires_at < new Date()
    }
    
    return data
  } catch (error) {
    // Log error but don't throw
    console.error(`Error fetching vendor suspension: ${error instanceof Error ? error.message : 'Unknown error'}`)
    
    // Return a default object that marks the vendor as not suspended
    return {
      is_suspended: false,
      suspension_reason: null,
      suspended_at: null,
      suspension_expires_at: null,
      status: 'active' as 'active' | 'holiday' | 'suspended',
      has_expired: false
    }
  }
}

/**
 * Check if a vendor is available for purchases
 * Returns true if the vendor is active (not suspended and not on holiday)
 */
export function isVendorAvailable(availability: VendorAvailability): boolean {
  // Ensure we check both the available flag and status to determine availability
  if (!availability) return true // Default to available if no data
  
  // If status is explicitly 'holiday' or onHoliday flag is true, vendor is not available
  const isOnHoliday = availability.status === 'holiday' || availability.onHoliday
  
  // If status is explicitly 'suspended' or suspended flag is true, vendor is not available
  const isSuspended = availability.status === 'suspended' || availability.suspended
  
  return availability.available && !isSuspended && !isOnHoliday
}

/**
 * Gets the reason why a vendor is unavailable
 */
export function getVendorUnavailabilityReason(
  availability: VendorAvailability, 
  holidayMode?: VendorHolidayMode
): { type: 'suspended' | 'holiday' | null; message: string | null } {
  // Check for suspension status using both the flag and the status field
  if (availability.suspended || availability.status === 'suspended') {
    return { type: 'suspended', message: 'This vendor is currently suspended.' }
  }
  
  // Check for holiday status using both the flag and the status field
  if (availability.onHoliday || availability.status === 'holiday') {
    return { 
      type: 'holiday', 
      message: holidayMode?.holiday_message || 'This vendor is currently on holiday.' 
    }
  }
  
  return { type: null, message: null }
}

/**
 * ✅ NEW: Batched vendor status - fetches all status data in a single request
 * This replaces the need to call getVendorAvailability, getVendorHolidayMode, and getVendorSuspension separately
 */
export type VendorCompleteStatus = {
  availability: VendorAvailability
  holiday: VendorHolidayMode | null
  suspension: VendorSuspension | null
}

export async function getVendorCompleteStatus(vendorId: string): Promise<VendorCompleteStatus> {
  // Validate vendorId
  if (!vendorId || vendorId === 'undefined') {
    console.warn(`Invalid vendorId in getVendorCompleteStatus: ${vendorId}`)
    return {
      availability: getDefaultAvailability(),
      holiday: null,
      suspension: null
    }
  }
  
  try {
    const response = await fetch(
      `${MEDUSA_BACKEND_URL}/store/vendors/${vendorId}/status`,
      {
        next: { revalidate: 3600 }, // Cache for 1 hour (ISR compatible)
        headers: getHeaders(),
        signal: AbortSignal.timeout(10000) // 10 second timeout
      }
    )
    
    if (!response.ok) {
      if (response.status !== 404) {
        console.warn(`Vendor status API returned ${response.status} for vendor ${vendorId}`)
      }
      return {
        availability: getDefaultAvailability(),
        holiday: null,
        suspension: null
      }
    }
    
    const data = await response.json()
    
    // Transform backend response to frontend format
    const availability: VendorAvailability = {
      available: data.availability?.is_available ?? true,
      suspended: data.suspension?.is_suspended ?? false,
      onHoliday: data.availability?.onHoliday ?? false,
      message: data.availability?.reason ?? null,
      status: data.suspension?.is_suspended ? 'suspended' : 
              data.availability?.onHoliday ? 'holiday' : 'active',
      suspension_expires_at: data.suspension?.suspension_expires_at ? 
        new Date(data.suspension.suspension_expires_at) : null
    }
    
    const holiday: VendorHolidayMode | null = data.holiday ? {
      is_holiday_mode: data.holiday.is_on_holiday ?? false,
      holiday_start_date: data.holiday.holiday_start ? new Date(data.holiday.holiday_start) : null,
      holiday_end_date: data.holiday.holiday_end ? new Date(data.holiday.holiday_end) : null,
      holiday_message: data.holiday.holiday_message ?? null,
      auto_reactivate: false,
      status: availability.status
    } : null
    
    const suspension: VendorSuspension | null = data.suspension ? {
      is_suspended: data.suspension.is_suspended ?? false,
      suspension_reason: data.suspension.suspension_reason ?? null,
      suspended_at: data.suspension.suspended_at ? new Date(data.suspension.suspended_at) : null,
      suspension_expires_at: data.suspension.suspension_expires_at ? 
        new Date(data.suspension.suspension_expires_at) : null,
      status: availability.status,
      has_expired: false
    } : null
    
    return {
      availability,
      holiday,
      suspension
    }
  } catch (error) {
    console.error(`Error fetching vendor complete status: ${error instanceof Error ? error.message : 'Unknown error'}`)
    return {
      availability: getDefaultAvailability(),
      holiday: null,
      suspension: null
    }
  }
}
