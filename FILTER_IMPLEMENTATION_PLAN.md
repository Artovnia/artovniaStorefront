# Database-Based Product Filtering Implementation Plan

## 📋 Overview

This document outlines the implementation plan for adding database-based filtering to the ProductListing component, enabling filters to work without Algolia dependency.

**Target Component:** `F:\StronyInternetowe\mercur\ArtovniaStorefront\src\components\organisms\ProductFilterBar`

**Estimated Time:** 2-3 days

**Priority:** Medium (for backup/bot mode functionality)

---

## 🎯 Goals

1. Enable filters to work in database mode (ProductListing component)
2. Create custom backend endpoint for filtered product queries
3. Build DatabaseProductFilterBar component
4. Maintain compatibility with existing Algolia-based filtering
5. Ensure optimal database query performance

---

## 📊 Current State Analysis

### What Works:
- ✅ Category filtering (native Medusa support)
- ✅ Seller filtering (client-side filter in `listProductsWithSort`)
- ✅ Pagination (limit/offset)
- ✅ Basic sorting (created_at)

### What Doesn't Work:
- ❌ Color filtering (no backend support)
- ❌ Size filtering (no backend support)
- ❌ Price range filtering (no backend support)
- ❌ Condition filtering (no backend support)
- ❌ Rating filtering (no backend support)
- ❌ Dimension filtering (no backend support)

### Root Cause:
Medusa's default `/store/products` endpoint only supports built-in fields. Custom filters require a custom backend route with proper database queries.

---

## 🏗️ Implementation Plan

### Phase 1: Backend API Development (Day 1)

#### Step 1.1: Create Filtered Products Endpoint
**File:** `F:\StronyInternetowe\mercur\mercur\apps\backend\src\api\store\products-filtered\route.ts`

```typescript
import { MedusaRequest, MedusaResponse } from '@medusajs/framework'
import { ContainerRegistrationKeys } from '@medusajs/framework/utils'

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  
  const {
    category_id,
    seller_id,
    color,
    size,
    min_price,
    max_price,
    condition,
    min_rating,
    min_width,
    max_width,
    min_height,
    max_height,
    min_depth,
    max_depth,
    limit = 12,
    offset = 0,
    region_id,
    order = '-created_at'
  } = req.query

  // Build dynamic WHERE clause
  const filters: any = { 
    deleted_at: null,
    status: 'published'
  }
  
  // Category filter
  if (category_id) {
    filters['categories.id'] = category_id
  }
  
  // Seller filter
  if (seller_id) {
    filters['seller.id'] = seller_id
  }
  
  // Color filter (via product_color_link table)
  if (color) {
    filters['product_colors.color.name'] = { $ilike: `%${color}%` }
  }
  
  // Size filter (via product options)
  if (size) {
    filters['variants.options.value'] = { $ilike: `%${size}%` }
  }
  
  // Price filter (via calculated_price)
  if (min_price || max_price) {
    filters['variants.calculated_price.calculated_amount'] = {}
    if (min_price) {
      filters['variants.calculated_price.calculated_amount'].$gte = parseFloat(min_price)
    }
    if (max_price) {
      filters['variants.calculated_price.calculated_amount'].$lte = parseFloat(max_price)
    }
  }
  
  // Metadata filters
  if (condition) {
    filters['metadata.condition'] = condition
  }
  
  // Dimension filters
  if (min_width || max_width) {
    filters['width'] = {}
    if (min_width) filters['width'].$gte = parseFloat(min_width)
    if (max_width) filters['width'].$lte = parseFloat(max_width)
  }
  
  if (min_height || max_height) {
    filters['height'] = {}
    if (min_height) filters['height'].$gte = parseFloat(min_height)
    if (max_height) filters['height'].$lte = parseFloat(max_height)
  }
  
  if (min_depth || max_depth) {
    filters['length'] = {}
    if (min_depth) filters['length'].$gte = parseFloat(min_depth)
    if (max_depth) filters['length'].$lte = parseFloat(max_depth)
  }

  try {
    const { data: products, count } = await query.graph({
      entity: 'product',
      fields: [
        '*',
        'variants.*',
        'variants.calculated_price',
        'variants.options.*',
        'seller.*',
        'categories.*',
        'categories.parent_category',
        'product_colors.*',
        'product_colors.color.*',
        'metadata'
      ],
      filters,
      pagination: { skip: parseInt(offset), take: parseInt(limit) },
      order: { created_at: order === '-created_at' ? 'DESC' : 'ASC' }
    })
    
    return res.json({ 
      products, 
      count,
      limit: parseInt(limit),
      offset: parseInt(offset)
    })
  } catch (error) {
    console.error('Error fetching filtered products:', error)
    return res.status(500).json({ 
      error: 'Failed to fetch products',
      message: error.message 
    })
  }
}
```

#### Step 1.2: Create Filter Options Endpoint
**File:** `F:\StronyInternetowe\mercur\mercur\apps\backend\src\api\store\product-filter-options\route.ts`

```typescript
import { MedusaRequest, MedusaResponse } from '@medusajs/framework'
import { ContainerRegistrationKeys } from '@medusajs/framework/utils'

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const { category_id, seller_id } = req.query
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  
  try {
    // Build base filter for scoping
    const baseFilter: any = { 
      deleted_at: null,
      status: 'published'
    }
    
    if (category_id) {
      baseFilter['categories.id'] = category_id
    }
    
    if (seller_id) {
      baseFilter['seller.id'] = seller_id
    }

    // Fetch available colors
    const colorsResult = await query.graph({
      entity: 'color',
      fields: ['id', 'name', 'display_name', 'hex_code'],
      filters: {
        'product_colors.product': baseFilter
      }
    })
    
    // Fetch available sizes (from product options)
    const sizesResult = await query.graph({
      entity: 'product_option_value',
      fields: ['value'],
      filters: {
        'option.title': { $ilike: '%size%' },
        'variant.product': baseFilter
      }
    })
    
    // Fetch price range
    const priceResult = await query.graph({
      entity: 'product_variant',
      fields: ['calculated_price.calculated_amount'],
      filters: {
        'product': baseFilter
      }
    })
    
    const prices = priceResult.data
      .map(v => v.calculated_price?.calculated_amount)
      .filter(p => p !== null && p !== undefined)
    
    // Fetch dimension ranges
    const dimensionsResult = await query.graph({
      entity: 'product',
      fields: ['width', 'height', 'length'],
      filters: baseFilter
    })
    
    const widths = dimensionsResult.data.map(p => p.width).filter(Boolean)
    const heights = dimensionsResult.data.map(p => p.height).filter(Boolean)
    const depths = dimensionsResult.data.map(p => p.length).filter(Boolean)
    
    return res.json({
      colors: colorsResult.data || [],
      sizes: [...new Set(sizesResult.data.map(s => s.value))],
      priceRange: {
        min: prices.length > 0 ? Math.min(...prices) : 0,
        max: prices.length > 0 ? Math.max(...prices) : 10000
      },
      dimensionRanges: {
        width: {
          min: widths.length > 0 ? Math.min(...widths) : 0,
          max: widths.length > 0 ? Math.max(...widths) : 200
        },
        height: {
          min: heights.length > 0 ? Math.min(...heights) : 0,
          max: heights.length > 0 ? Math.max(...heights) : 200
        },
        depth: {
          min: depths.length > 0 ? Math.min(...depths) : 0,
          max: depths.length > 0 ? Math.max(...depths) : 200
        }
      },
      conditions: ['new', 'like_new', 'used', 'vintage', 'refurbished']
    })
  } catch (error) {
    console.error('Error fetching filter options:', error)
    return res.status(500).json({ 
      error: 'Failed to fetch filter options',
      message: error.message 
    })
  }
}
```

#### Step 1.3: Add Database Indexes for Performance
**File:** `F:\StronyInternetowe\mercur\mercur\apps\backend\src\migrations\[timestamp]-add-product-filter-indexes.ts`

```typescript
import { MigrationInterface, QueryRunner } from "typeorm"

export class AddProductFilterIndexes[TIMESTAMP] implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Index on product.width for dimension filtering
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_product_width ON product(width) 
      WHERE width IS NOT NULL
    `)
    
    // Index on product.height for dimension filtering
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_product_height ON product(height) 
      WHERE height IS NOT NULL
    `)
    
    // Index on product.length for dimension filtering
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_product_length ON product(length) 
      WHERE length IS NOT NULL
    `)
    
    // Index on metadata.condition for condition filtering
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_product_metadata_condition 
      ON product((metadata->>'condition'))
    `)
    
    // Composite index for common filter combinations
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_product_category_seller 
      ON product(category_id, seller_id) 
      WHERE deleted_at IS NULL
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_product_width`)
    await queryRunner.query(`DROP INDEX IF EXISTS idx_product_height`)
    await queryRunner.query(`DROP INDEX IF EXISTS idx_product_length`)
    await queryRunner.query(`DROP INDEX IF EXISTS idx_product_metadata_condition`)
    await queryRunner.query(`DROP INDEX IF EXISTS idx_product_category_seller`)
  }
}
```

---

### Phase 2: Frontend Data Layer (Day 2 Morning)

#### Step 2.1: Create Frontend API Client
**File:** `F:\StronyInternetowe\mercur\ArtovniaStorefront\src\lib\data\products-filtered.ts`

```typescript
import { sdk } from '@/lib/config'
import { HttpTypes } from '@medusajs/types'
import { getAuthHeaders } from './cookies'
import { getRegion } from './regions'

export interface ProductFilterParams {
  category_id?: string
  seller_id?: string
  color?: string
  size?: string
  min_price?: number
  max_price?: number
  condition?: string
  min_rating?: number
  min_width?: number
  max_width?: number
  min_height?: number
  max_height?: number
  min_depth?: number
  max_depth?: number
  limit?: number
  offset?: number
  order?: string
}

export interface FilterOptions {
  colors: Array<{
    id: string
    name: string
    display_name: string
    hex_code: string
  }>
  sizes: string[]
  priceRange: {
    min: number
    max: number
  }
  dimensionRanges: {
    width: { min: number; max: number }
    height: { min: number; max: number }
    depth: { min: number; max: number }
  }
  conditions: string[]
}

export const listProductsFiltered = async (
  params: ProductFilterParams,
  countryCode: string = 'pl'
): Promise<{
  products: HttpTypes.StoreProduct[]
  count: number
  limit: number
  offset: number
}> => {
  const region = await getRegion(countryCode)
  
  if (!region) {
    console.error('No region found for filtered products')
    return { products: [], count: 0, limit: 12, offset: 0 }
  }

  const headers = await getAuthHeaders()

  try {
    const response = await sdk.client.fetch<{
      products: HttpTypes.StoreProduct[]
      count: number
      limit: number
      offset: number
    }>(`/store/products-filtered`, {
      method: 'GET',
      query: {
        ...params,
        region_id: region.id
      },
      headers,
      next: { revalidate: 300 }
    })

    return response
  } catch (error) {
    console.error('Error fetching filtered products:', error)
    return { products: [], count: 0, limit: 12, offset: 0 }
  }
}

export const getFilterOptions = async (
  category_id?: string,
  seller_id?: string
): Promise<FilterOptions> => {
  try {
    const response = await sdk.client.fetch<FilterOptions>(
      `/store/product-filter-options`,
      {
        method: 'GET',
        query: {
          category_id,
          seller_id
        },
        next: { revalidate: 600 } // Cache for 10 minutes
      }
    )

    return response
  } catch (error) {
    console.error('Error fetching filter options:', error)
    return {
      colors: [],
      sizes: [],
      priceRange: { min: 0, max: 10000 },
      dimensionRanges: {
        width: { min: 0, max: 200 },
        height: { min: 0, max: 200 },
        depth: { min: 0, max: 200 }
      },
      conditions: []
    }
  }
}
```

---

### Phase 3: Frontend Components (Day 2 Afternoon)

#### Step 3.1: Create DatabaseProductFilterBar Component
**File:** `F:\StronyInternetowe\mercur\ArtovniaStorefront\src\components\organisms\ProductFilterBar\DatabaseProductFilterBar.tsx`

```typescript
"use client"

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { getFilterOptions, FilterOptions } from '@/lib/data/products-filtered'
import { ColorFilter, SizeFilter, PriceFilter, ProductRatingFilter } from '@/components/cells'
import { CombinedDimensionFilter } from '@/components/cells/CombinedDimensionFilter/CombinedDimensionFilter'

interface DatabaseProductFilterBarProps {
  category_id?: string
  seller_id?: string
  className?: string
}

export const DatabaseProductFilterBar = ({
  category_id,
  seller_id,
  className
}: DatabaseProductFilterBarProps) => {
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  // Fetch filter options on mount and when category/seller changes
  useEffect(() => {
    const fetchOptions = async () => {
      setIsLoading(true)
      const options = await getFilterOptions(category_id, seller_id)
      setFilterOptions(options)
      setIsLoading(false)
    }

    fetchOptions()
  }, [category_id, seller_id])

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (value === null || value === '') {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    
    // Reset to page 1 when filters change
    params.delete('page')
    
    router.push(`${pathname}?${params.toString()}`)
  }

  const updateRangeFilter = (minKey: string, maxKey: string, min: number | null, max: number | null) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (min !== null) {
      params.set(minKey, min.toString())
    } else {
      params.delete(minKey)
    }
    
    if (max !== null) {
      params.set(maxKey, max.toString())
    } else {
      params.delete(maxKey)
    }
    
    // Reset to page 1 when filters change
    params.delete('page')
    
    router.push(`${pathname}?${params.toString()}`)
  }

  if (isLoading || !filterOptions) {
    return (
      <div className="flex gap-4 animate-pulse">
        <div className="h-10 w-32 bg-gray-200 rounded"></div>
        <div className="h-10 w-32 bg-gray-200 rounded"></div>
        <div className="h-10 w-32 bg-gray-200 rounded"></div>
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="flex flex-wrap gap-4">
        {/* Color Filter */}
        {filterOptions.colors.length > 0 && (
          <ColorFilter
            colors={filterOptions.colors}
            selectedColor={searchParams.get('color') || undefined}
            onChange={(color) => updateFilter('color', color)}
          />
        )}

        {/* Size Filter */}
        {filterOptions.sizes.length > 0 && (
          <SizeFilter
            sizes={filterOptions.sizes}
            selectedSize={searchParams.get('size') || undefined}
            onChange={(size) => updateFilter('size', size)}
          />
        )}

        {/* Price Filter */}
        <PriceFilter
          range={filterOptions.priceRange}
          selectedMin={searchParams.get('min_price') ? parseFloat(searchParams.get('min_price')!) : undefined}
          selectedMax={searchParams.get('max_price') ? parseFloat(searchParams.get('max_price')!) : undefined}
          onChange={(min, max) => updateRangeFilter('min_price', 'max_price', min, max)}
        />

        {/* Dimension Filter */}
        <CombinedDimensionFilter
          ranges={filterOptions.dimensionRanges}
          selectedWidth={{
            min: searchParams.get('min_width') ? parseFloat(searchParams.get('min_width')!) : undefined,
            max: searchParams.get('max_width') ? parseFloat(searchParams.get('max_width')!) : undefined
          }}
          selectedHeight={{
            min: searchParams.get('min_height') ? parseFloat(searchParams.get('min_height')!) : undefined,
            max: searchParams.get('max_height') ? parseFloat(searchParams.get('max_height')!) : undefined
          }}
          selectedDepth={{
            min: searchParams.get('min_depth') ? parseFloat(searchParams.get('min_depth')!) : undefined,
            max: searchParams.get('max_depth') ? parseFloat(searchParams.get('max_depth')!) : undefined
          }}
          onWidthChange={(min, max) => updateRangeFilter('min_width', 'max_width', min, max)}
          onHeightChange={(min, max) => updateRangeFilter('min_height', 'max_height', min, max)}
          onDepthChange={(min, max) => updateRangeFilter('min_depth', 'max_depth', min, max)}
        />

        {/* Condition Filter */}
        {filterOptions.conditions.length > 0 && (
          <select
            value={searchParams.get('condition') || ''}
            onChange={(e) => updateFilter('condition', e.target.value || null)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="">All Conditions</option>
            {filterOptions.conditions.map(condition => (
              <option key={condition} value={condition}>
                {condition.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  )
}
```

#### Step 3.2: Update ProductListing to Use Filtered Endpoint
**File:** `F:\StronyInternetowe\mercur\ArtovniaStorefront\src\components\sections\ProductListing\ProductListing.tsx`

```typescript
// Add import
import { listProductsFiltered } from '@/lib/data/products-filtered'
import { DatabaseProductFilterBar } from '@/components/organisms/ProductFilterBar/DatabaseProductFilterBar'

// In fetchProducts function, replace listProductsWithSort with:
const result = await listProductsFiltered({
  category_id,
  seller_id,
  color: searchParams.get('color') || undefined,
  size: searchParams.get('size') || undefined,
  min_price: searchParams.get('min_price') ? parseFloat(searchParams.get('min_price')!) : undefined,
  max_price: searchParams.get('max_price') ? parseFloat(searchParams.get('max_price')!) : undefined,
  condition: searchParams.get('condition') || undefined,
  min_width: searchParams.get('min_width') ? parseFloat(searchParams.get('min_width')!) : undefined,
  max_width: searchParams.get('max_width') ? parseFloat(searchParams.get('max_width')!) : undefined,
  min_height: searchParams.get('min_height') ? parseFloat(searchParams.get('min_height')!) : undefined,
  max_height: searchParams.get('max_height') ? parseFloat(searchParams.get('max_height')!) : undefined,
  min_depth: searchParams.get('min_depth') ? parseFloat(searchParams.get('min_depth')!) : undefined,
  max_depth: searchParams.get('max_depth') ? parseFloat(searchParams.get('max_depth')!) : undefined,
  limit: PRODUCT_LIMIT,
  offset
}, DEFAULT_REGION)

// Replace ProductFilterBar with DatabaseProductFilterBar:
<DatabaseProductFilterBar 
  category_id={category_id}
  seller_id={seller_id}
/>
```

---

### Phase 4: Testing & Optimization (Day 3)

#### Step 4.1: Unit Tests
- Test filter options API with various category/seller combinations
- Test filtered products API with all filter combinations
- Test edge cases (empty results, invalid filters, etc.)

#### Step 4.2: Performance Testing
- Measure query performance with EXPLAIN ANALYZE
- Verify indexes are being used
- Test with large datasets (1000+ products)
- Optimize slow queries

#### Step 4.3: Integration Testing
- Test filter UI interactions
- Test filter persistence in URL
- Test pagination with filters
- Test filter reset functionality

#### Step 4.4: Browser Testing
- Test on Chrome, Firefox, Safari
- Test mobile responsiveness
- Test loading states
- Test error states

---

## 🔧 Database Optimization Checklist

- [ ] Add indexes on `product.width`, `product.height`, `product.length`
- [ ] Add index on `product.metadata->>'condition'`
- [ ] Add composite index on `(category_id, seller_id)`
- [ ] Add index on `product_color_link.product_id`
- [ ] Add index on `product_option_value.value`
- [ ] Run VACUUM ANALYZE after adding indexes
- [ ] Monitor query performance with pg_stat_statements

---

## 📝 Migration Strategy

### Option A: Feature Flag (Recommended)
```typescript
// Add environment variable
ENABLE_DATABASE_FILTERS=true

// In SmartProductsListing:
const useDatabaseFilters = process.env.ENABLE_DATABASE_FILTERS === 'true'

if (isBot || !hasAlgoliaConfig || useDatabaseFilters) {
  return <ProductListing useFilters={useDatabaseFilters} />
}
```

### Option B: Gradual Rollout
1. Deploy backend endpoints (no frontend changes)
2. Test endpoints manually
3. Deploy DatabaseProductFilterBar (hidden behind flag)
4. Enable for 10% of users
5. Monitor performance
6. Gradually increase to 100%

---

## 🚨 Potential Issues & Solutions

### Issue 1: Slow Queries
**Solution:** Ensure all indexes are in place, use query caching

### Issue 2: Color Filter Performance
**Solution:** Denormalize colors to product table if needed

### Issue 3: Price Filter Complexity
**Solution:** Cache min/max prices per category

### Issue 4: Memory Usage
**Solution:** Limit filter options to top 100 values

---

## ✅ Success Criteria

- [ ] All filters work in database mode
- [ ] Query performance < 500ms for filtered results
- [ ] Filter options load < 200ms
- [ ] No breaking changes to existing Algolia mode
- [ ] 100% test coverage for new endpoints
- [ ] Documentation updated
- [ ] No increase in error rate

---

## 📚 Documentation Updates Needed

1. Update README with database filtering documentation
2. Add API documentation for new endpoints
3. Update component documentation for DatabaseProductFilterBar
4. Add migration guide for switching from Algolia to database filters

---

## 🎯 Post-Implementation

### Monitoring
- Track filter usage analytics
- Monitor query performance
- Track error rates
- Monitor cache hit rates

### Future Enhancements
- Add faceted search counts (e.g., "Red (23)")
- Add filter presets (e.g., "Under $50")
- Add saved filter combinations
- Add filter recommendations based on category

---

**Created:** December 16, 2024  
**Status:** Ready for Implementation  
**Assignee:** TBD  
**Estimated Effort:** 2-3 days
