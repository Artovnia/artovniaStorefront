# Icon Implementation Debugging Guide

## Current Status
Icons are implemented but not showing in the navbar dropdown. Let's debug step by step.

## ✅ What's Confirmed Working

1. **Icon files exist**: `AllIcons.tsx` with 12 custom icons + 1 generic
2. **Mappings are correct**: All handles match your URLs
   - `bizuteria` ✅
   - `torebki-i-plecaki` ✅
   - `bizuteria-meska` ✅
   - `dekoracje` ✅
   - `urodziny` ✅
3. **Import chain**: 
   - `AllIcons.tsx` → exports icons
   - `category-icons.tsx` → imports and maps
   - `CategoryNavbar.tsx` → imports getCategoryIcon

## 🔍 Debug Steps

### Step 1: Check Browser Console
1. Open your app in browser
2. Press F12 to open DevTools
3. Go to Console tab
4. Hover over "Ona" category in navbar
5. Look for console.log output:
   ```
   Category handle: "bizuteria" Icon: "Found" or "Not found"
   ```

**What to look for:**
- ✅ If "Found" → Icons are loading, rendering issue
- ❌ If "Not found" → Mapping or import issue
- ❌ If no console output → Component not rendering

### Step 2: Check Network Tab
1. In DevTools, go to Network tab
2. Reload page
3. Filter by "AllIcons"
4. Check if `AllIcons.tsx` is being loaded

### Step 3: Check React DevTools
1. Install React DevTools extension
2. Open Components tab
3. Find `FullWidthDropdown` component
4. Check if `IconComponent` exists in the component tree

### Step 4: Visual Inspection
1. Hover over a category
2. Right-click on where icon should be
3. Inspect element
4. Look for `<svg>` tags

## 🐛 Common Issues & Fixes

### Issue 1: Icons not imported
**Symptom**: Console shows "Not found"
**Fix**: Check import path in `category-icons.tsx`
```typescript
// Should be:
import { ... } from '@/components/atoms/icons/subcategories/AllIcons'
```

### Issue 2: TypeScript path alias not working
**Symptom**: Build errors or imports fail
**Fix**: Check `tsconfig.json` has correct paths:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Issue 3: Component not rendering
**Symptom**: No console output at all
**Fix**: Check if `FullWidthDropdown` is being rendered

### Issue 4: SVG not visible
**Symptom**: Console shows "Found" but no icon visible
**Possible causes**:
- SVG color matches background
- SVG size is 0
- CSS hiding the icon
- z-index issue

**Fix**: Add temporary background to test:
```typescript
<IconComponent className="w-5 h-5 flex-shrink-0 bg-red-500" />
```

### Issue 5: Build cache
**Symptom**: Changes not reflecting
**Fix**: 
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

## 🔧 Quick Tests

### Test 1: Direct Icon Import
Create a test file:
```typescript
// src/app/test-icons/page.tsx
import { BiżuteriaIcon } from '@/components/atoms/icons/subcategories/AllIcons'

export default function TestPage() {
  return (
    <div className="p-10">
      <h1>Icon Test</h1>
      <BiżuteriaIcon className="w-20 h-20" />
    </div>
  )
}
```
Visit `/test-icons` - if icon shows, import works!

### Test 2: Check Mapping
In browser console:
```javascript
// Open console and type:
import('./const/category-icons').then(m => {
  console.log('All icons:', Object.keys(m.ALL_CATEGORY_ICONS))
  console.log('Bizuteria icon:', m.getCategoryIcon('bizuteria'))
})
```

### Test 3: Inline Icon Test
Temporarily add to CategoryNavbar:
```typescript
import { BiżuteriaIcon } from '@/components/atoms/icons/subcategories/AllIcons'

// In render:
<BiżuteriaIcon className="w-5 h-5" /> {/* Should show icon */}
```

## 📋 Checklist

Before asking for help, verify:
- [ ] Dev server is running (`npm run dev`)
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] Browser console shows no errors
- [ ] Correct category is being hovered
- [ ] Dropdown is actually opening
- [ ] Console.log is showing output
- [ ] Import paths use `@/` alias correctly
- [ ] Files are saved and server restarted

## 🆘 Report Format

When reporting the issue, please provide:

1. **Console Output**:
   ```
   [Paste console.log output here]
   ```

2. **Network Tab**: Screenshot or list of loaded files

3. **Element Inspection**: 
   - Does `<svg>` exist in DOM?
   - What's the computed CSS?

4. **Component State**:
   - Is dropdown visible?
   - Are children categories loading?

5. **Browser**: Chrome/Firefox/Safari version

## 🎯 Expected Behavior

When working correctly:
1. Hover "Ona" → Dropdown opens
2. Console shows: `Category handle: "bizuteria" Icon: "Found"`
3. Icon (necklace SVG) appears next to "Biżuteria"
4. Icon is dark color (#3B3634)
5. Icon is 20px × 20px (w-5 h-5)

---

**Next Step**: Please check your browser console and share the output!
