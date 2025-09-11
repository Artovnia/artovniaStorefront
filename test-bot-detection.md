# Bot Detection Testing Guide

## Method 1: Environment Variable Testing (Recommended)

### Option A: Next.js Environment Variable
```bash
# Add to .env.local file
NEXT_PUBLIC_FORCE_BOT_MODE=true

# Then run
npm run dev
```

### Option B: Command Line (Windows PowerShell)
```powershell
$env:NEXT_PUBLIC_FORCE_BOT_MODE="true"; npm run dev
```

### Option C: Command Line (Windows CMD)
```cmd
set NEXT_PUBLIC_FORCE_BOT_MODE=true && npm run dev
```

## Method 2: Browser User Agent Testing

### Chrome DevTools Method:
1. Open Chrome DevTools (F12)
2. Go to Network Conditions tab (or Console → Settings → More tools → Network conditions)
3. Uncheck "Use browser default"
4. Set custom User Agent to: `amazonbot/1.0`
5. Refresh the page

### Popular Bot User Agents to Test:
```
amazonbot/1.0
Googlebot/2.1
curl/7.68.0
python-requests/2.25.1
aws-cli/2.0.0
```

## Method 3: Browser Console Testing

Open browser console and run:
```javascript
// Force bot detection
localStorage.setItem('forceBotMode', 'true');
location.reload();

// Check current detection
console.log('Is Bot:', window.navigator.userAgent);
```

## Method 4: URL Parameter Testing

Add this to any URL:
```
http://localhost:3000/categories?bot=true
```

## What to Look For:

### ✅ Bot Mode Active (Database):
- Console shows: "Using ProductListing (Database)"
- No Algolia network requests in DevTools
- Products load from `/store/products` API
- Faster initial load
- No search/filter UI elements

### ❌ Human Mode Active (Algolia):
- Console shows: "Using AlgoliaProductsListing"
- Algolia network requests visible in DevTools
- Search and filter functionality available
- InstantSearch components loaded

## Debugging Commands:

### Check Environment Variables:
```javascript
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('FORCE_BOT_MODE:', process.env.NEXT_PUBLIC_FORCE_BOT_MODE);
```

### Check Bot Detection:
```javascript
import { detectBot, forceBotMode } from '@/lib/utils/bot-detection';
console.log('Force Bot Mode:', forceBotMode());
console.log('Detect Bot:', detectBot());
```

## Network Tab Verification:

### Bot Mode (Database):
- Requests to: `localhost:9000/store/products`
- No requests to: `algolia.net` or `algolianet.com`

### Human Mode (Algolia):
- Requests to: `*.algolia.net`
- Algolia search queries visible
