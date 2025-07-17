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
  console.log(`DEBUG - Getting vendor availability for vendor ID: ${vendorId}`)
  
  try {
    // First try to check if the vendor exists
    if (!vendorId || vendorId === 'undefined') {
      console.warn(`Invalid vendorId in getVendorAvailability: ${vendorId}`)
      return getDefaultAvailability()
    }
    
    const response = await fetch(
      `${MEDUSA_BACKEND_URL}/store/vendors/${vendorId}/availability`,
      {
        cache: "no-store",
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
        console.log(`Vendor availability API returned status: ${response.status} - using default values`)
      }
      return getDefaultAvailability()
    }
    
    // Get the response data
    const data = await response.json()
    console.log('DEBUG - Vendor availability raw response:', data)
    
    // Ensure onHoliday is properly set based on status
    if (data.status === 'holiday') {
      data.onHoliday = true
      console.log('DEBUG - Setting onHoliday to true based on status field')
    }
    
    // Parse date if it exists
    if (data.suspension_expires_at) {
      data.suspension_expires_at = new Date(data.suspension_expires_at)
    }
    
    console.log('DEBUG - Final vendor availability data:', data)
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
        cache: "no-store",
        headers: getHeaders(),
        signal: AbortSignal.timeout(10000)
      }
    )
    if (!response.ok) {
      // 404 is expected for vendors without records - no need to log
      // 500 might happen during initial setup - handle gracefully
      if (response.status !== 404) {
        console.log(`Vendor holiday mode API returned status: ${response.status} for vendorId: ${vendorId} - using default values`)
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
    
    console.log('DEBUG - Holiday mode raw response:', data)
  
  const now = new Date()
  console.log('DEBUG - Current date for comparison:', now)
  
  // Parse dates if they exist
  if (data.holiday_start_date) {
    data.holiday_start_date = new Date(data.holiday_start_date)
    console.log('DEBUG - Parsed holiday_start_date:', data.holiday_start_date)
  }
  
  if (data.holiday_end_date) {
    data.holiday_end_date = new Date(data.holiday_end_date)
    console.log('DEBUG - Parsed holiday_end_date:', data.holiday_end_date)
  }
  
  // Log holiday status and comparison with current date
  if (data.is_holiday_mode) {
    if (data.holiday_start_date && data.holiday_end_date) {
      const isCurrentlyOnHoliday = now >= data.holiday_start_date && now <= data.holiday_end_date
      console.log('DEBUG - Is currently between holiday dates?', isCurrentlyOnHoliday)
    } else {
      console.log('DEBUG - Holiday mode is enabled but dates are missing')
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
    console.log(`DEBUG - Getting vendor suspension for vendor ID: ${vendorId}`)
    // Validate vendorId - return safe fallback if not valid
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
        cache: "no-store",
        headers: getHeaders(),
        signal: AbortSignal.timeout(10000)
      }
    )

    if (!response.ok) {
      // 404 is expected for vendors without records - no need to log
      // 500 might happen during initial setup - handle gracefully
      if (response.status !== 404) {
        console.log(`Vendor suspension API returned status: ${response.status} for vendorId: ${vendorId} - using default values`)
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
    
    console.log('DEBUG - Suspension data:', data)
    
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
