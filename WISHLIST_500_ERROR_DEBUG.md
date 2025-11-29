# Wishlist 500 Error - Debugging Guide

## Error Summary

**Error:** `Failed to add item to wishlist: 500 Internal Server Error`

**Location:** `src\lib\data\wishlist.ts` line 101

**Type:** Backend error (not frontend issue)

---

## Root Cause

The **500 Internal Server Error** is coming from your **Medusa backend**, not the frontend. The frontend is sending the request correctly, but the backend is failing to process it.

---

## Frontend Request (Correct ✅)

### Request Details:

**Endpoint:** `POST /store/wishlist`

**Headers:**
```javascript
{
  "authorization": "Bearer <token>",
  "Content-Type": "application/json",
  "x-publishable-api-key": "<your-key>"
}
```

**Body:**
```json
{
  "reference": "product",
  "reference_id": "<product-id>"
}
```

### Frontend Code (No Issues):

```typescript
// src/lib/data/wishlist.ts (lines 55-111)
export const addWishlistItem = async ({
  reference_id,
  reference,
}: {
  reference_id: string
  reference: "product"
}) => {
  const authHeaders = await getAuthHeaders()
  
  // ✅ Check authentication
  if (!('authorization' in authHeaders)) {
    console.error('❌ No authorization header found')
    throw new Error('User not authenticated')
  }
  
  const headers = {
    ...authHeaders,
    "Content-Type": "application/json",
    "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
  }

  try {
    const response = await fetch(
      `${process.env.MEDUSA_BACKEND_URL}/store/wishlist`,
      {
        headers,
        method: "POST",
        body: JSON.stringify({
          reference,
          reference_id,
        }),
      }
    )
    
    if (!response.ok) {
      const errorText = await response.text()
      
      // Handle "already exists" case
      if (response.status === 400 && errorText.includes('Cannot create multiple links')) {
        revalidatePath("/wishlist")
        return { success: true, alreadyExists: true }
      }
      
      // ❌ THIS IS WHERE YOUR ERROR OCCURS
      throw new Error(`Failed to add item to wishlist: ${response.status} ${response.statusText}`)
    }
    
    revalidatePath("/", "layout")
    revalidatePath("/wishlist")
    return { success: true, alreadyExists: false }
  } catch (error) {
    throw error
  }
}
```

**Frontend is working correctly** ✅

---

## Backend Issue (500 Error ❌)

The 500 error means your **Medusa backend** is crashing or encountering an error when processing the wishlist request.

### Common Causes:

1. **Database Connection Issue**
   - PostgreSQL connection lost
   - Database credentials incorrect
   - Database not running

2. **Missing Wishlist Module**
   - Wishlist plugin not installed
   - Wishlist module not configured
   - Wishlist routes not registered

3. **Database Schema Issue**
   - Wishlist tables not created
   - Missing migrations
   - Column mismatch

4. **Backend Code Error**
   - Bug in wishlist service
   - Unhandled exception
   - Type mismatch

5. **Authentication Issue**
   - Invalid JWT token
   - Customer not found
   - Session expired

---

## Debugging Steps

### 1. Check Medusa Backend Logs

**Look for error messages in your backend console:**

```bash
# If running locally
cd <your-medusa-backend-directory>
npm run dev

# Watch for errors when adding to wishlist
```

**Look for:**
- Stack traces
- Database errors
- "Cannot find module" errors
- Type errors
- Null reference errors

### 2. Check Database Connection

**Verify PostgreSQL is running:**

```bash
# Check if PostgreSQL is running
psql -U postgres -c "SELECT version();"

# Check if your database exists
psql -U postgres -l | grep medusa
```

**Check database connection in Medusa:**

```bash
# In your Medusa backend directory
cat medusa-config.js | grep DATABASE_URL
```

### 3. Check Wishlist Module Installation

**Verify wishlist module is installed:**

```bash
# In your Medusa backend directory
npm list | grep wishlist
# OR
yarn list | grep wishlist
```

**Check if wishlist routes are registered:**

```bash
# Look for wishlist routes in your backend
grep -r "wishlist" src/api/
```

### 4. Check Database Schema

**Verify wishlist tables exist:**

```sql
-- Connect to your database
psql -U postgres -d <your-medusa-db>

-- Check if wishlist tables exist
\dt *wishlist*

-- Check wishlist table structure
\d wishlist
\d wishlist_item
```

**Expected tables:**
- `wishlist`
- `wishlist_item` (or similar)

### 5. Test Backend Directly

**Use curl or Postman to test the endpoint:**

```bash
# Get your auth token first
curl -X POST http://localhost:9000/store/auth \
  -H "Content-Type: application/json" \
  -d '{"email": "your-email@example.com", "password": "your-password"}'

# Copy the token from response

# Test add to wishlist
curl -X POST http://localhost:9000/store/wishlist \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -H "x-publishable-api-key: <your-key>" \
  -d '{"reference": "product", "reference_id": "<product-id>"}'
```

**Check the response:**
- 200: Success
- 400: Bad request (check error message)
- 401: Unauthorized (token issue)
- 404: Endpoint not found (wishlist module not installed)
- 500: Backend error (check logs)

---

## Possible Solutions

### Solution 1: Install Wishlist Module

If wishlist module is not installed:

```bash
# In your Medusa backend directory
npm install medusa-plugin-wishlist
# OR
yarn add medusa-plugin-wishlist
```

**Add to `medusa-config.js`:**

```javascript
const plugins = [
  // ... other plugins
  {
    resolve: `medusa-plugin-wishlist`,
    options: {
      // Configuration options
    },
  },
]
```

**Run migrations:**

```bash
npm run migrations run
# OR
yarn migrations run
```

### Solution 2: Fix Database Schema

If tables are missing:

```bash
# Create migration
npm run migrations create add-wishlist-tables
# OR
yarn migrations create add-wishlist-tables

# Run migrations
npm run migrations run
# OR
yarn migrations run
```

### Solution 3: Check Backend Code

If you have custom wishlist implementation, check:

**File:** `src/api/store/wishlist/route.ts` (or similar)

```typescript
// Example expected structure
export async function POST(req: Request) {
  try {
    const { reference, reference_id } = await req.json()
    
    // Get customer from session
    const customer = req.scope.resolve("customer")
    
    // Add to wishlist
    const wishlistService = req.scope.resolve("wishlistService")
    const result = await wishlistService.addItem({
      customer_id: customer.id,
      reference,
      reference_id,
    })
    
    return Response.json(result)
  } catch (error) {
    console.error("Error adding to wishlist:", error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
```

### Solution 4: Check Environment Variables

**Verify in your Medusa backend `.env`:**

```bash
DATABASE_URL=postgresql://user:password@localhost:5432/medusa-db
JWT_SECRET=your-jwt-secret
COOKIE_SECRET=your-cookie-secret
```

---

## Frontend Changes (If Needed)

### Add Better Error Handling

**Update `WishlistButton.tsx`:**

```typescript
const handleAddToWishlist = async () => {
  try {
    setIsWishlistAdding(true)
    const result = await addWishlistItem({
      reference_id: productId,
      reference: "product",
    })
    
    setIsWishlisted(true)
    
    if (onWishlistChange) {
      onWishlistChange()
    }
    
    setTimeout(() => {
      router.refresh()
    }, 100)
  } catch (error) {
    console.error('❌ Error adding to wishlist:', error)
    
    // ✅ NEW: Show user-friendly error message
    alert('Nie udało się dodać do ulubionych. Spróbuj ponownie później.')
    
    // ✅ NEW: Log detailed error for debugging
    console.error('Error details:', {
      productId,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    })
  } finally {
    setIsWishlistAdding(false)
  }
}
```

### Add Backend Error Logging

**Update `wishlist.ts`:**

```typescript
export const addWishlistItem = async ({
  reference_id,
  reference,
}: {
  reference_id: string
  reference: "product"
}) => {
  const authHeaders = await getAuthHeaders()
  
  if (!('authorization' in authHeaders)) {
    console.error('❌ No authorization header found for add wishlist request')
    throw new Error('User not authenticated')
  }
  
  const headers = {
    ...authHeaders,
    "Content-Type": "application/json",
    "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY as string,
  }

  try {
    const response = await fetch(
      `${process.env.MEDUSA_BACKEND_URL}/store/wishlist`,
      {
        headers,
        method: "POST",
        body: JSON.stringify({
          reference,
          reference_id,
        }),
      }
    )
    
    if (!response.ok) {
      const errorText = await response.text()
      
      // ✅ NEW: Log detailed error information
      console.error('❌ Wishlist API Error:', {
        status: response.status,
        statusText: response.statusText,
        errorText,
        reference_id,
        reference,
        timestamp: new Date().toISOString()
      })
      
      if (response.status === 400 && errorText.includes('Cannot create multiple links')) {
        revalidatePath("/wishlist")
        return { success: true, alreadyExists: true }
      }
      
      throw new Error(`Failed to add item to wishlist: ${response.status} ${response.statusText}`)
    }
    
    revalidatePath("/", "layout")
    revalidatePath("/wishlist")
    return { success: true, alreadyExists: false }
  } catch (error) {
    // ✅ NEW: Log full error
    console.error('❌ Exception in addWishlistItem:', error)
    throw error
  }
}
```

---

## Testing Checklist

After fixing the backend:

- [ ] Backend starts without errors
- [ ] Database connection works
- [ ] Wishlist tables exist
- [ ] Can add item to wishlist via curl/Postman
- [ ] Can add item to wishlist from frontend
- [ ] Can remove item from wishlist
- [ ] Can view wishlist
- [ ] Wishlist persists after page refresh

---

## Summary

**The issue is NOT in the frontend code.** ✅

**The issue is in your Medusa backend.** ❌

**Next steps:**

1. Check Medusa backend logs for error details
2. Verify wishlist module is installed and configured
3. Check database schema and migrations
4. Test backend endpoint directly with curl/Postman
5. Fix backend error based on logs
6. Test again from frontend

**No frontend changes were made during the performance optimization that would affect wishlist functionality.**
