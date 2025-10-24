/**
 * Test component to verify icons work
 */
"use client"

import React from 'react'
import { BiżuteriaIcon, UbraniaIcon, GenericSubcategoryIcon } from '@/components/atoms/icons/subcategories/AllIcons'

export const TestIconComponent = () => {
  return (
    <div style={{ padding: '20px', background: 'white' }}>
      <h2>Icon Test</h2>
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <div>
          <p>Biżuteria Icon:</p>
          <BiżuteriaIcon className="w-10 h-10" />
        </div>
        <div>
          <p>Ubrania Icon:</p>
          <UbraniaIcon className="w-10 h-10" />
        </div>
        <div>
          <p>Generic Icon:</p>
          <GenericSubcategoryIcon className="w-10 h-10" />
        </div>
      </div>
    </div>
  )
}
