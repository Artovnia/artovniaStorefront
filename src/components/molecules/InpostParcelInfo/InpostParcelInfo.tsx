"use client"

import React from "react"
import { Text } from "@medusajs/ui"
import { InpostParcelData } from "@/lib/services/inpost-api"

type InpostParcelInfoProps = {
  parcelData: InpostParcelData
}

export const InpostParcelInfo: React.FC<InpostParcelInfoProps> = ({ parcelData }) => {
  if (!parcelData) return null
  
  return (
    <div className="mt-2 p-3 bg-ui-bg-base rounded-md">
      <Text className="txt-small-plus text-ui-fg-base font-medium">Paczkomat InPost:</Text>
      <Text className="txt-small text-ui-fg-subtle">
        {parcelData.machineName}
      </Text>
      <Text className="txt-small text-ui-fg-subtle">
        {parcelData.machineAddress}
      </Text>
      <Text className="txt-small text-ui-fg-subtle">
        {parcelData.machinePostCode} {parcelData.machineCity}
      </Text>
    </div>
  )
}

export default InpostParcelInfo
