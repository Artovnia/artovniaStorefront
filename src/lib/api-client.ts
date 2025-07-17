/**
 * Direct API client for Medusa backend
 * Handles proper JSON encoding and prevents double JSON encoding issues
 */
import { getPublishableApiKey } from './get-publishable-key';

const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000';

interface ApiClientOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  query?: Record<string, string>;
}

/**
 * Makes a fetch request to the Medusa backend with proper JSON handling
 */
export async function apiRequest<T = any>(
  endpoint: string, 
  options: ApiClientOptions = {}
): Promise<T> {
  const { 
    method = 'GET',
    headers = {},
    body,
    query = {}
  } = options;

  // Build URL with query parameters
  const url = new URL(`${BACKEND_URL}${endpoint}`);
  Object.entries(query).forEach(([key, value]) => {
    if (value) url.searchParams.append(key, value);
  });
  
  // Get the publishable API key
  const publishableKey = await getPublishableApiKey();

  // Prepare headers with content type and publishable API key
  const requestHeaders: HeadersInit = {
    'Accept': 'application/json',
    'x-publishable-api-key': publishableKey,
    ...headers
  };

  // Only add Content-Type for requests with body
  if (body && method !== 'GET') {
    requestHeaders['Content-Type'] = 'application/json';
  }

  // Prepare request options
  const requestOptions: RequestInit = {
    method,
    headers: requestHeaders,
    credentials: 'include',
  };

  // Add body if provided (and not GET request)
  if (body && method !== 'GET') {
    // Ensure we're not double-encoding JSON
    requestOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
    
    // Debug log to verify request body
    console.log(`API Request to ${endpoint}:`, {
      method,
      bodyType: typeof requestOptions.body,
      bodyLength: (requestOptions.body as string).length,
      bodyPreview: (requestOptions.body as string).substring(0, 100)
    });
  }

  try {
    const response = await fetch(url.toString(), requestOptions);
    
    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'An error occurred');
      }
      
      return data;
    } else {
      // Handle non-JSON responses (like HTML from PayU)
      const text = await response.text();
      
      if (!response.ok) {
        throw new Error(`Request failed: ${response.statusText}`);
      }
      
      return { text, status: response.status } as unknown as T;
    }
  } catch (error) {
    console.error(`API request to ${endpoint} failed:`, error);
    throw error;
  }
}

/**
 * Payment-specific API methods following Medusa documentation
 * @see https://docs.medusajs.com/resources/commerce-modules/payment/payment-checkout-flow
 */
export const paymentApi = {
  // Get payment collections for a cart
  getPaymentCollections: async (cartId: string) => {
    return apiRequest('/store/payment-collections', {
      method: 'GET',
      query: { cart_id: cartId }
    });
  },
  
  // Create payment sessions on a payment collection
  createPaymentSession: async (paymentCollectionId: string, providerId: string) => {
    return apiRequest(`/store/payment-collections/${paymentCollectionId}/payment-sessions`, {
      method: 'POST',
      body: {
        provider_id: providerId
      }
    });
  },
  
  // Authorize a payment session
  authorizePaymentSession: async (paymentCollectionId: string, sessionId: string) => {
    return apiRequest(`/store/payment-collections/${paymentCollectionId}/payment-sessions/${sessionId}/authorize`, {
      method: 'POST'
    });
  },
  
  // Update a payment session
  updatePaymentSession: async (paymentCollectionId: string, sessionId: string, data: Record<string, any>) => {
    return apiRequest(`/store/payment-collections/${paymentCollectionId}/payment-sessions/${sessionId}`, {
      method: 'POST',
      body: data
    });
  },
  
  // Select a payment session as the active one
  selectPaymentSession: async (paymentCollectionId: string, sessionId: string) => {
    return apiRequest(`/store/payment-collections/${paymentCollectionId}/payment-sessions/${sessionId}/select`, {
      method: 'POST'
    });
  },
  
  // Complete a cart/order - this will create payment collections if needed
  completeCart: async (cartId: string) => {
    return apiRequest(`/store/carts/${cartId}/complete`, {
      method: 'POST'
    });
  },
  
  // Refresh payment sessions for a cart
  refreshCartPaymentSessions: async (cartId: string) => {
    return apiRequest(`/store/carts/${cartId}/payment-sessions`, {
      method: 'POST'
    });
  }
};
