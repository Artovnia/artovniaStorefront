# Category Icons System - Complete Implementation

## 📁 Files Created

1. **`category-icons.tsx`** - Main icon mapping file
2. **`CATEGORY_ICONS_USAGE.md`** - Detailed usage guide
3. **`INTEGRATION_EXAMPLE.tsx`** - Code examples for integration
4. **`index.ts`** - Updated to export category icons

## 🎯 What's Included

### Icon Mappings for All Categories

#### Main Categories (8 categories)
- ✨ **Nowości** (nowosci) → Sparkles
- 👤 **Ona** (ona) → User
- 👥 **On** (on) → Users
- 🎁 **Dziecko** (dziecko) → Gift
- ❤️ **Zwierzęta** (zwierzeta) → Heart
- 🏪 **Dom** (dom) → BuildingStorefront
- 🛍️ **Akcesoria** (akcesoria) → ShoppingBag
- 🎁 **Prezenty i okazje** (prezenty-i-okazje) → Gift
- 🕐 **Vintage** (vintage) → Clock

#### Subcategories (60+ subcategories)
All subcategories have appropriate icons mapped by handle.

### Organized by Category Groups

```typescript
// Separate exports for each main category's subcategories
MAIN_CATEGORY_ICONS          // Top-level categories
ONA_SUBCATEGORY_ICONS        // Ona subcategories
ON_SUBCATEGORY_ICONS         // On subcategories
DZIECKO_SUBCATEGORY_ICONS    // Dziecko subcategories
ZWIERZETA_SUBCATEGORY_ICONS  // Zwierzęta subcategories
DOM_SUBCATEGORY_ICONS        // Dom subcategories
AKCESORIA_SUBCATEGORY_ICONS  // Akcesoria subcategories
PREZENTY_SUBCATEGORY_ICONS   // Prezenty i okazje subcategories
VINTAGE_SUBCATEGORY_ICONS    // Vintage subcategories

// Combined map
ALL_CATEGORY_ICONS           // All icons in one object
```

## 🚀 Quick Start

### 1. Import the Helper Function

```typescript
import { getCategoryIcon } from '@/const/category-icons'
```

### 2. Use in Your Component

```typescript
const IconComponent = getCategoryIcon(category.handle)
return (
  <div className="flex items-center gap-2">
    <IconComponent className="w-5 h-5" />
    <span>{category.name}</span>
  </div>
)
```

## 📝 Integration Steps

### Option A: Update CategoryNavbar.tsx

1. Import the icon helper:
```typescript
import { getCategoryIcon } from '@/const/category-icons'
```

2. In `CategoryNavItem` component, add icon:
```typescript
const IconComponent = getCategoryIcon(category.handle || '')

// In JSX:
<Link className="flex items-center gap-2">
  <IconComponent className="w-5 h-5" />
  <span>{category.name}</span>
</Link>
```

3. In `FullWidthDropdown`, add icons to subcategories:
```typescript
{children.map((child) => {
  const IconComponent = getCategoryIcon(child.handle || '')
  return (
    <Link className="flex items-center gap-2">
      <IconComponent className="w-5 h-5" />
      <span>{child.name}</span>
    </Link>
  )
})}
```

### Option B: Copy from Examples

See `INTEGRATION_EXAMPLE.tsx` for complete working examples:
- `CategoryNavItemWithIcon` - Basic implementation
- `FullWidthDropdownWithIcons` - Dropdown with icons
- `CategoryNavItemHoverIcon` - Icons appear on hover
- `MultiLevelIconExample` - Different icon sizes per level
- `ConditionalIconExample` - Only show icons when available

## 🎨 Styling Options

### Icon Sizes
```typescript
className="w-4 h-4"  // Small (16px)
className="w-5 h-5"  // Medium (20px) - Recommended
className="w-6 h-6"  // Large (24px)
```

### Icon Colors
```typescript
className="w-5 h-5"                    // Inherit text color
className="w-5 h-5 text-primary"       // Primary color
className="w-5 h-5 hover:text-primary" // Hover effect
```

### Spacing
```typescript
// Use gap utility (recommended)
<div className="flex items-center gap-2">
  <IconComponent className="w-5 h-5" />
  <span>Text</span>
</div>

// Or use margin
<IconComponent className="w-5 h-5 mr-2" />
```

## 🔧 Available Helper Functions

### `getCategoryIcon(handle: string)`
Returns the icon component for a category handle. Falls back to `ShoppingBag` if not found.

```typescript
const IconComponent = getCategoryIcon('ona')
<IconComponent className="w-5 h-5" />
```

### `hasCategoryIcon(handle: string)`
Checks if a category has a custom icon mapped.

```typescript
if (hasCategoryIcon('ona')) {
  // Render with icon
}
```

### `NAVBAR_ICON_CONFIG`
Default configuration for navbar icons.

```typescript
{
  size: 20,              // Default size in pixels
  className: "mr-2",     // Default margin-right
  strokeWidth: 1.5,      // Icon stroke width
}
```

## 📦 Icon Source

All icons are from `@medusajs/icons` package (v2.7.1), which is already installed as a dependency of `@medusajs/ui`.

Available icons used:
- Sparkles, User, Users, ShoppingBag, Gift, Clock
- Heart, CreditCard, CheckCircle, PencilSquare
- InformationCircleSolid, XMark, ChevronUpDown
- BuildingStorefront, Tag, Star, Photo, Swatch
- LightBulb, Calendar, Envelope, ArrowPath, EyeMini

## 🎯 Benefits

✅ **Type-safe** - Full TypeScript support
✅ **Tree-shakeable** - Only used icons are bundled
✅ **Consistent** - All icons from same library
✅ **Flexible** - Easy to customize and extend
✅ **Organized** - Icons grouped by category
✅ **Documented** - Complete usage examples

## 🔄 Extending the System

### Add New Icon Mapping

```typescript
// In category-icons.tsx
import { NewIcon } from "@medusajs/icons"

export const CUSTOM_CATEGORY_ICONS: CategoryIconMap = {
  "new-category": NewIcon,
}

// Update ALL_CATEGORY_ICONS
export const ALL_CATEGORY_ICONS: CategoryIconMap = {
  ...MAIN_CATEGORY_ICONS,
  ...CUSTOM_CATEGORY_ICONS, // Add here
  // ... other maps
}
```

### Override Default Icon

```typescript
// Just update the mapping in the appropriate section
export const MAIN_CATEGORY_ICONS: CategoryIconMap = {
  "ona": DifferentIcon, // Change this
}
```

## 📚 Reference Files

- **Usage Guide**: `CATEGORY_ICONS_USAGE.md`
- **Integration Examples**: `INTEGRATION_EXAMPLE.tsx`
- **Icon Mappings**: `category-icons.tsx`

## 🎨 Design Recommendations

1. **Consistency**: Use same icon size across same level (e.g., all main categories = 20px)
2. **Hierarchy**: Larger icons for main categories, smaller for subcategories
3. **Color**: Use text color inheritance for better theme support
4. **Spacing**: Use `gap-2` (8px) between icon and text
5. **Alignment**: Use `flex items-center` for vertical centering

## 🚀 Next Steps

1. Review the integration examples in `INTEGRATION_EXAMPLE.tsx`
2. Choose your preferred implementation style
3. Update `CategoryNavbar.tsx` with icon support
4. Test with your category data
5. Adjust styling as needed for your design

## 💡 Tips

- Icons automatically inherit text color unless specified
- Use `flex-shrink-0` on icons to prevent squishing
- Consider adding icons only to top-level and first-level subcategories
- Test with different screen sizes to ensure proper spacing
- Use hover effects to make navigation more interactive

---

**Created**: Category icons system for Medusa.js marketplace
**Icons**: 60+ category mappings using @medusajs/icons
**Status**: Ready for integration ✅
