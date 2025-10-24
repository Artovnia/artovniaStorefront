# Category Icons Usage Guide

## Overview
This guide shows how to use the category icon system in your navbar and other components.

## Available Exports

```typescript
import {
  // Icon maps by category group
  MAIN_CATEGORY_ICONS,
  ONA_SUBCATEGORY_ICONS,
  ON_SUBCATEGORY_ICONS,
  DZIECKO_SUBCATEGORY_ICONS,
  ZWIERZETA_SUBCATEGORY_ICONS,
  DOM_SUBCATEGORY_ICONS,
  AKCESORIA_SUBCATEGORY_ICONS,
  PREZENTY_SUBCATEGORY_ICONS,
  VINTAGE_SUBCATEGORY_ICONS,
  
  // Combined map
  ALL_CATEGORY_ICONS,
  
  // Helper functions
  getCategoryIcon,
  hasCategoryIcon,
  
  // Configuration
  NAVBAR_ICON_CONFIG,
  
  // TypeScript type
  CategoryIconMap,
} from '@/const/category-icons'
```

## Basic Usage

### 1. Get Icon Component by Handle

```typescript
import { getCategoryIcon } from '@/const/category-icons'

const category = { handle: 'ona', name: 'Ona' }
const IconComponent = getCategoryIcon(category.handle)

// Render the icon
<IconComponent className="w-5 h-5" />
```

### 2. Check if Category Has Icon

```typescript
import { hasCategoryIcon } from '@/const/category-icons'

if (hasCategoryIcon(category.handle)) {
  // Render with icon
} else {
  // Render without icon or with default
}
```

### 3. Use in CategoryNavbar Component

```typescript
// In CategoryNavItem component
import { getCategoryIcon, NAVBAR_ICON_CONFIG } from '@/const/category-icons'

const CategoryNavItem = ({ category, isActive, onHover, onClose }) => {
  const IconComponent = getCategoryIcon(category.handle)
  
  return (
    <div onMouseEnter={onHover}>
      <Link
        href={`/categories/${category.handle}`}
        onClick={handleCategoryClick}
        className={cn(
          "uppercase px-4 py-2 hover:bg-primary/10 transition-colors text-lg",
          "flex items-center gap-2 my-3 md:my-0",
          category.handle === currentCategoryHandle && "md:border-b-2 md:border-primary text-primary",
          isActive && "bg-primary/5",
          "font-['Instrument_Sans']"
        )}
      >
        <IconComponent className={cn("w-5 h-5", NAVBAR_ICON_CONFIG.className)} />
        <span>{category.name}</span>
      </Link>
    </div>
  )
}
```

### 4. Use in Dropdown (FullWidthDropdown)

```typescript
import { getCategoryIcon } from '@/const/category-icons'

export const FullWidthDropdown = ({ activeCategory, isVisible, onClose }) => {
  const children = activeCategory.category_children || []
  
  return (
    <div className="w-full z-50 bg-primary">
      <div className="max-w-[1920px] mx-auto p-6">
        <div className="grid gap-x-6 gap-y-6 grid-cols-[repeat(auto-fit,minmax(180px,max-content))]">
          {children.map((child) => {
            const IconComponent = getCategoryIcon(child.handle)
            
            return (
              <div key={child.id} className="space-y-4">
                <Link
                  href={`/categories/${child.handle}`}
                  className="flex items-center gap-2 text-lg font-semibold hover:text-primary"
                >
                  <IconComponent className="w-5 h-5" />
                  <span>{child.name}</span>
                </Link>
                
                {/* Grandchildren without icons */}
                {child.category_children?.map((grandchild) => (
                  <Link
                    key={grandchild.id}
                    href={`/categories/${grandchild.handle}`}
                    className="block text-sm text-gray-700 hover:text-primary"
                  >
                    {grandchild.name}
                  </Link>
                ))}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
```

## Icon Mapping Reference

### Main Categories
- **nowosci** → Sparkles (✨)
- **ona** → User (👤)
- **on** → Users (👥)
- **dziecko** → Gift (🎁)
- **zwierzeta** → Heart (❤️)
- **dom** → BuildingStorefront (🏪)
- **akcesoria** → ShoppingBag (🛍️)
- **prezenty-i-okazje** → Gift (🎁)
- **vintage** → Clock (🕐)

### Subcategories Examples

**Ona (Her):**
- bizuteria → Heart
- ubrania → Tag
- torebki-i-plecaki → ShoppingBag
- dodatki → Star

**On (Him):**
- bizuteria-meska → Swatch
- ubrania-leskie → Tag
- dodatki-meskie → Star
- akcesoria-meskie → ShoppingBag

**Dom (Home):**
- dekoracje → Photo
- tekstylia → Tag
- meble → BuildingStorefront
- lampy → LightBulb
- kuchnia-i-jadalnia → ShoppingBag
- organizacja → CheckCircle
- ogrod-i-balkon → Star

## Styling Tips

### Icon Sizes
```typescript
// Small (navbar items)
<IconComponent className="w-4 h-4" />

// Medium (default)
<IconComponent className="w-5 h-5" />

// Large (headers)
<IconComponent className="w-6 h-6" />
```

### Icon Colors
```typescript
// Inherit text color
<IconComponent className="w-5 h-5" />

// Custom color
<IconComponent className="w-5 h-5 text-primary" />

// Hover effect
<IconComponent className="w-5 h-5 group-hover:text-primary transition-colors" />
```

### With Spacing
```typescript
// Use gap utility
<div className="flex items-center gap-2">
  <IconComponent className="w-5 h-5" />
  <span>Category Name</span>
</div>

// Or use margin from config
import { NAVBAR_ICON_CONFIG } from '@/const/category-icons'
<IconComponent className={cn("w-5 h-5", NAVBAR_ICON_CONFIG.className)} />
```

## TypeScript Support

```typescript
import type { CategoryIconMap } from '@/const/category-icons'

// Create custom icon map
const customIcons: CategoryIconMap = {
  "custom-category": MyCustomIcon,
}

// Type-safe icon component
const IconComponent: React.ComponentType<{ className?: string }> = getCategoryIcon('ona')
```

## Notes

- All icons are from `@medusajs/icons` package
- Icons are React components that accept `className` prop
- Default fallback is `ShoppingBag` icon if category handle not found
- Icons are tree-shakeable - only imported icons are bundled
