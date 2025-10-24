/**
 * Test file to verify icon imports and mappings
 * Run this to debug icon issues
 */

import { getCategoryIcon, ALL_CATEGORY_ICONS } from './category-icons'

// Test 1: Check if icons are imported
console.log('=== ICON IMPORT TEST ===')
console.log('Total icons in ALL_CATEGORY_ICONS:', Object.keys(ALL_CATEGORY_ICONS).length)
console.log('Icon handles:', Object.keys(ALL_CATEGORY_ICONS))

// Test 2: Test specific category handles
const testHandles = [
  'bizuteria',
  'ubrania',
  'torebki-i-plecaki',
  'dodatki',
  'bizuteria-meska',
  'ubrania-leskie',
  'dodatki-meskie',
  'akcesoria-meskie',
  'ubranka',
  'zabawki',
]

console.log('\n=== SPECIFIC HANDLE TESTS ===')
testHandles.forEach(handle => {
  const icon = getCategoryIcon(handle)
  console.log(`Handle: "${handle}" -> Icon: ${icon ? '✅ Found' : '❌ Not found'}`)
})

// Test 3: Check icon component
const testIcon = getCategoryIcon('bizuteria')
console.log('\n=== ICON COMPONENT TEST ===')
console.log('bizuteria icon:', testIcon)
console.log('Is function?', typeof testIcon === 'function')

export {}
