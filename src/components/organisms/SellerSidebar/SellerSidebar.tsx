"use client"

import { StarRating, Button } from "@/components/atoms"
import { Modal, ReportSellerForm } from "@/components/molecules"
import { MessageForm } from "@/components/cells/SellerMessageTab/MessageForm"
import { SellerProps } from "@/types/seller"
import { HttpTypes } from "@medusajs/types"
import { format } from "date-fns"
import { useState } from "react"

type SellerSidebarProps = {
  seller: SellerProps
  user: HttpTypes.StoreCustomer | null
}

export const SellerSidebar = ({ seller, user }: SellerSidebarProps) => {
  const [openReportModal, setOpenReportModal] = useState(false)
  
  const { photo, name, reviews, description, created_at, id } = seller

  const reviewCount = reviews ? reviews?.length : 0

  const rating =
    reviews && reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0

  return (
    <div className="border rounded-sm p-6 space-y-6 bg-primary">
      {/* Seller Image/Logo - Full display without cropping */}
      {photo && (
        <div className="flex justify-center">
          <div className="relative w-full max-w-[200px] aspect-square overflow-hidden rounded-sm border border-gray-200">
            <img 
              src={photo} 
              alt={name}
              className="w-full h-full object-contain bg-white"
            />
          </div>
        </div>
      )}
      
      {/* Name - Centered */}
      <h1 className="heading-lg text-center text-[#3B3634]">
        {name}
      </h1>
      
      {/* Rating - Centered */}
      <div className="flex flex-col items-center gap-2">
        <StarRating starSize={20} rate={rating || 0} />
        <span className="text-sm text-secondary">
          ({reviewCount} recenzji)
        </span>
      </div>
      
      {/* Description - Left aligned, condensed */}
      {description && (
        <div 
          dangerouslySetInnerHTML={{ __html: description }}
          className="text-sm text-secondary line-clamp-4 leading-relaxed"
        />
      )}
      
      {/* Contact Form Card - Only show if user is authenticated */}
      {user && (
        <div className="border border-[#3B3634] rounded-sm p-4 bg-primary ">
          <h3 className="heading-sm uppercase mb-4 text-xs tracking-wider">
            Napisz wiadomość do {name}
          </h3>
          <MessageForm 
            seller_id={id}
            seller_name={name}
            isAuthenticated={true}
            compact={true}
          />
        </div>
      )}
      
      {/* Footer Info */}
      <div className="border-t pt-4 space-y-3">
        <p className="text-md text-secondary">
          Dołączył {format(new Date(created_at), "yyyy-MM-dd")}
        </p>
        <Button
          variant="text"
          size="small"
          className="uppercase w-full text-left justify-start px-0"
          onClick={() => setOpenReportModal(true)}
        >
          Zgłoś
        </Button>
      </div>
      
      {/* Report Modal */}
      {openReportModal && (
        <Modal heading="Zgłoś sprzedawcę" onClose={() => setOpenReportModal(false)}>
          <ReportSellerForm onClose={() => setOpenReportModal(false)} />
        </Modal>
      )}
    </div>
  )
}
