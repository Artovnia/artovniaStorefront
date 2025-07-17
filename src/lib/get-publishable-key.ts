/**
 * Utility to fetch and cache the publishable API key from the Medusa backend
 */

// Default key to use as fallback
const DEFAULT_KEY = 'pk_01JVWG4XRHFKCCEV9JWZFXS4GJ';

// In-memory cache for the key
let cachedKey: string | null = null;

/**
 * Gets the publishable API key from environment or fetches it from the backend
 */
export async function getPublishableApiKey(): Promise<string> {
  // First check environment variable
  if (process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY) {
    return process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY;
  }
  
  // Then check our cache
  if (cachedKey) {
    return cachedKey;
  }
  
  // As a last resort, try to fetch from the backend
  try {
    const response = await fetch('http://localhost:9000/store/publishable-api-keys', {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.publishable_api_keys && data.publishable_api_keys.length > 0) {
        // Use the first active key
        const activeKey = data.publishable_api_keys.find((key: any) => key.revoked_at === null);
        if (activeKey) {
          cachedKey = activeKey.id;
          return activeKey.id;
        }
      }
    }
    
    // If we couldn't get a key, use the default
    console.warn('Could not fetch publishable API key, using default');
    return DEFAULT_KEY;
  } catch (error) {
    console.error('Error fetching publishable API key:', error);
    return DEFAULT_KEY;
  }
}
