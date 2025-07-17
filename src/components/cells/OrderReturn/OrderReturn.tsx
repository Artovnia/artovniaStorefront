"use client"

import { Button } from "@/components/atoms"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"

interface OrderReturnProps {
  order: {
    id: string;
    created_at?: string;
    status?: string;
    fulfillment_status?: string;
    items?: Array<any>;
    is_order_set?: boolean;
    // Original parcels property
    parcels?: Array<{
      id: string;
      status?: string;
      statusRealizacji?: string;
      dostarczono_o?: string;
      wysłano_o?: string;
      spakowano_o?: string;
    }>;
    // Additional properties we might find in different API formats
    fulfillment?: {
      id: string;
      status?: string;
      dostarczono_o?: string;
      delivered_at?: string;
      delivery_date?: string;
    };
    fulfillments?: Array<{
      id: string;
      status?: string;
      dostarczono_o?: string;
      delivered_at?: string;
      delivery_date?: string;
    }>;
  };
}

/**
 * OrderReturn component that shows return eligibility and link to return page
 * Contains enhanced error prevention for empty order sets and proper eligibility checks
 */
export const OrderReturn = ({ order }: OrderReturnProps) => {
  // Check if order can be returned based on multiple criteria
  const isReturnEligible = () => {
    // Debug the order object to see what's available
    console.log("Checking return eligibility for order:", {
      id: order.id,
      status: order.status,
      fulfillment_status: order.fulfillment_status,
      item_count: order.items?.length || 0,
      is_order_set: order.is_order_set,
      created_at: order.created_at
    });
    
    // Must have items to be returned
    if (!order.items || order.items.length === 0) {
      console.log("Order has no items, not eligible for return");
      return false;
    }
    
    // Order status check - only allow completed/delivered orders
    const validStatuses = ["completed", "delivered"];
    if (!validStatuses.includes(order.status || "")) {
      console.log(`Order status '${order.status}' is not eligible for return (need one of ${validStatuses.join(", ")})`); 
      return false;
    }

    // Fulfillment status check - also require delivered status if fulfillment_status exists
    if (order.fulfillment_status !== undefined && 
        order.fulfillment_status !== "delivered" && 
        order.fulfillment_status !== "completed") {
      console.log(`Fulfillment status '${order.fulfillment_status}' is not eligible for return`);
      return false;
    }

    // Enhanced debugging to find where parcels data might be
    console.log("Full order object for debugging:", order);
    
    // Safely check all possible locations for fulfillment data
    console.log("Direct parcels property:", order.parcels);
    // Use safe property access for potentially undefined properties
    console.log("Fulfillment property:", (order as any).fulfillment);
    console.log("Fulfillments property:", (order as any).fulfillments);
    
    // Get the delivery date from the most appropriate source
    let deliveryDate = null;
    
    // Try to find parcels from different possible locations in the order object
    // Using type assertion to access potentially undefined properties
    const possibleParcels = order.parcels || 
                            ((order as any).fulfillments || []) || 
                            ((order as any).fulfillment ? [(order as any).fulfillment] : []);
    
    if (possibleParcels && possibleParcels.length > 0) {
      console.log("Found possible parcels:", possibleParcels);
      
      // Find the latest delivery date among all parcels
      for (const parcel of possibleParcels) {
        // Check all possible delivery date field names
        const deliveryDateStr = parcel.dostarczono_o || parcel.delivered_at || parcel.delivery_date;
        
        if (deliveryDateStr) {
          console.log("Found delivery date:", deliveryDateStr);
          const parcelDeliveryDate = new Date(deliveryDateStr);
          if (!deliveryDate || parcelDeliveryDate > deliveryDate) {
            deliveryDate = parcelDeliveryDate;
            console.log("Using delivery date:", deliveryDate);
          }
        }
      }
    }
    
    // Fallback to order creation date if no delivery date found
    if (!deliveryDate && order.created_at) {
      deliveryDate = new Date(order.created_at);
      console.log("No delivery date found, using order creation date as fallback");
    }
    
    if (deliveryDate) {
      const currentDate = new Date();
      const daysSinceDelivery = Math.floor((currentDate.getTime() - deliveryDate.getTime()) / (1000 * 3600 * 24));
      const maxReturnDays = 14; // Standard 14-day return window from delivery date

      // If more than the maximum days, not eligible
      if (daysSinceDelivery > maxReturnDays) {
        console.log(`Order was delivered ${daysSinceDelivery} days ago, beyond the ${maxReturnDays} day return window`);
        return false;
      }

      console.log(`Order was delivered ${daysSinceDelivery} days ago, within the ${maxReturnDays} day return window`);
    } else {
      // If we can't find delivery date but the order status is completed/delivered,
      // we'll make the order eligible for return since it was likely delivered recently
      // This ensures customers can return recent orders even if delivery data is missing
      if (order.status === "completed" || order.status === "delivered" || 
          order.fulfillment_status === "delivered" || order.fulfillment_status === "completed") {
        console.log("Order marked as completed/delivered but no delivery date found. Making eligible for return.");
        return true;
      }
    }

    console.log("Order IS eligible for return");
    return true;
  };
  
  const eligible = isReturnEligible();
  
  // Calculate days left for return based on delivery date - using same approach as in eligibility check
  let daysLeft = 0;
  let deliveryDate = null;
  
  // Try to find parcels from different possible locations in the order object
  // Using type assertion to access potentially undefined properties
  const possibleParcels = order.parcels || 
                          ((order as any).fulfillments || []) || 
                          ((order as any).fulfillment ? [(order as any).fulfillment] : []);
  
  if (possibleParcels && possibleParcels.length > 0) {
    // Find the latest delivery date among all parcels
    for (const parcel of possibleParcels) {
      // Check all possible delivery date field names
      const deliveryDateStr = parcel.dostarczono_o || parcel.delivered_at || parcel.delivery_date;
      
      if (deliveryDateStr) {
        const parcelDeliveryDate = new Date(deliveryDateStr);
        if (!deliveryDate || parcelDeliveryDate > deliveryDate) {
          deliveryDate = parcelDeliveryDate;
        }
      }
    }
  }
  
  // We know the order is recent, so if we can't find a delivery date,
  // let's make the button available by using a recent date
  if (!deliveryDate) {
    // First try order creation date
    if (order.created_at) {
      deliveryDate = new Date(order.created_at);
    } else {
      // As a last resort, use yesterday's date to ensure eligibility
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      deliveryDate = yesterday;
      console.log("No dates found at all, using yesterday as fallback to enable returns");
    }
  }
  
  // Calculate days left if we have a valid date
  if (deliveryDate) {
    const currentDate = new Date();
    const daysSinceDelivery = Math.floor((currentDate.getTime() - deliveryDate.getTime()) / (1000 * 3600 * 24));
    const returnWindow = 14; // Standard return window in days per Polish law
    daysLeft = Math.max(0, returnWindow - daysSinceDelivery);
  }
  
  // If not eligible, show a message about why return isn't available
  if (!eligible) {
    return (
      <div className="md:flex justify-between items-center">
        <div className="mb-4 md:mb-0">
          <h2 className="text-primary label-lg uppercase">Zwroty</h2>
          <p className="text-secondary label-md max-w-sm">
            Ten zamówienie obecnie nie podlega zwrotowi. Znajdź więcej informacji o{" "}
            <LocalizedClientLink href="/returns" className="underline">
              zwrotach i zwrotach pieniędzy
            </LocalizedClientLink>.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="md:flex justify-between items-center">
      <div className="mb-4 md:mb-0">
        <h2 className="text-primary label-lg uppercase">Zwrot zamówienia</h2>
        <p className="text-secondary label-md max-w-sm">
          {daysLeft > 0 ? (
            <>Masz jeszcze {daysLeft} dni na zwrot zamówienia od daty odbioru przesyłki. </>
          ) : (
            <>Okres zwrotu zamówienia minął (14 dni od odbioru przesyłki), ale możesz nadal być kandydatem na zwrot. </>
          )}
          Znajdź więcej informacji o{" "}
          <LocalizedClientLink href="/returns" className="underline">
            zwrotach i zwrotach pieniędzy
          </LocalizedClientLink>.
        </p>
      </div>
      <LocalizedClientLink href={`/user/orders/${order.id}/return`}>
        <Button 
          variant="tonal" 
          className="uppercase hover:bg-black hover:text-white transition-colors"
        >
          Rozpocznij zwrot
        </Button>
      </LocalizedClientLink>
    </div>
  )
}