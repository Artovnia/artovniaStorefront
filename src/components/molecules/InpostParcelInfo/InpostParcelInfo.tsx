"use client"

import React from "react"
import { InpostParcelData } from "@/lib/services/inpost-api"
import { MapPin } from "lucide-react"

type InpostParcelInfoProps = {
  parcelData: InpostParcelData
}

export const InpostParcelInfo: React.FC<InpostParcelInfoProps> = ({ parcelData }) => {
  if (!parcelData) return null
  
  return (
    <div className="mt-3 p-3 bg-amber-50 border border-amber-200">
      <div className="flex items-start gap-2">
        <MapPin size={16} className="text-amber-600 mt-0.5 shrink-0" />
        <div>
          <p className="text-xs font-medium text-amber-800 uppercase tracking-wider mb-1">
            Paczkomat InPost
          </p>
          <p className="text-sm text-amber-900 font-medium">
            {parcelData.machineName}
          </p>
          <p className="text-xs text-amber-700">
            {parcelData.machineAddress}
          </p>
          <p className="text-xs text-amber-700">
            {parcelData.machinePostCode} {parcelData.machineCity}
          </p>
        </div>
      </div>
    </div>
  )
}

export default InpostParcelInfo
