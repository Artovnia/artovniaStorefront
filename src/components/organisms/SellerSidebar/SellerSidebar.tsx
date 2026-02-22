"use client"

import { StarRating, Button } from "@/components/atoms"
import { Modal, ReportSellerForm } from "@/components/molecules"
import { MessageForm } from "@/components/cells/SellerMessageTab/MessageForm"
import { SellerShareButton } from "@/components/cells/SellerShareButton/SellerShareButton"
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
  const [showMessageForm, setShowMessageForm] = useState(false)
  const [expandedMobile, setExpandedMobile] = useState(false)
  const [expandedDesktop, setExpandedDesktop] = useState(false)

  const { photo, name, reviews, description, created_at, id } = seller

  const reviewCount = reviews ? reviews?.length : 0

  const rating =
    reviews && reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0

  return (
    <>
      {/* MOBILE VERSION - Compact horizontal layout */}
      <div className="lg:hidden border rounded-sm p-4 space-y-4 bg-primary">
        {/* Seller Image/Logo - Full display without cropping */}
        {photo && (
          <div className="flex justify-center">
            <div className="relative w-full max-w-[100px] aspect-square overflow-hidden rounded-sm border border-gray-200">
              <img
                src={photo}
                alt={name}
                className="w-full h-full object-contain bg-white"
              />
            </div>
          </div>
        )}

        {/* Name with Share Button - Centered */}
        <div className="flex items-center justify-center gap-2">
          <h1 className="heading-md text-center text-[#3B3634]">{name}</h1>
          <SellerShareButton sellerName={name} />
        </div>

        {/* Description - Left aligned, with read more */}
        {description && (
          <div>
            <div
              dangerouslySetInnerHTML={{ __html: description }}
              className={`text-sm text-secondary leading-relaxed ${
                expandedMobile ? "" : "line-clamp-2"
              }`}
            />
            <button
              onClick={() => setExpandedMobile(!expandedMobile)}
              className="flex items-center justify-center text-xs text-[#3B3634] underline mt-1"
            >
              {expandedMobile ? "Zwiń" : "Czytaj więcej"}
            </button>
          </div>
        )}

        {/* Rating - Centered */}
        <div className="flex flex-col items-center gap-2">
          <StarRating starSize={16} rate={rating || 0} />
          <span className="text-sm text-secondary">
            ({reviewCount} recenzji)
          </span>
        </div>

        {/* Contact Button - Collapsible */}
        <button
          onClick={() => setShowMessageForm(!showMessageForm)}
          className="w-full border border-[#3B3634] p-3 bg-primary text-sm font-medium text-[#3B3634] hover:bg-[#3B3634] hover:text-white transition-colors"
        >
          {showMessageForm ? "✕ Zamknij" : "✉ Napisz wiadomość"}
        </button>

        {showMessageForm && (
          <div className="mt-2">
            <MessageForm
              seller_id={id}
              seller_name={name}
              isAuthenticated={!!user}
              compact={true}
            />
          </div>
        )}

        {/* Footer - Compact */}
        <div className="flex items-center justify-between text-xs text-secondary pt-3 border-t">
          <span>
            Dołączył {format(new Date(created_at), "MM/yyyy")}
          </span>
          <button
            onClick={() => setOpenReportModal(true)}
            className="text-[#3B3634] hover:underline"
          >
            Zgłoś
          </button>
        </div>
      </div>

      {/* DESKTOP VERSION - Full sidebar */}
      <div className="hidden lg:block border rounded-sm pr-6 pl-6 space-y-6 bg-primary">
        {/* Seller Image/Logo */}
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

        {/* Name with Share Button */}
        <div className="flex items-center justify-center gap-2">
          <h1 className="heading-lg text-center text-[#3B3634]">{name}</h1>
        </div>

        {/* Description - with read more */}
        {description && (
          <div>
            <div
              dangerouslySetInnerHTML={{ __html: description }}
              className={`text-sm text-secondary leading-relaxed ${
                expandedDesktop ? "" : "line-clamp-4"
              }`}
            />
            <button
              onClick={() => setExpandedDesktop(!expandedDesktop)}
              className="flex items-center justify-center text-xs text-[#3B3634] underline mt-1"
            >
              {expandedDesktop ? "Zwiń" : "Czytaj więcej"}
            </button>
          </div>
        )}

        <div className="flex items-center justify-center gap-2">
          <SellerShareButton sellerName={name} />
        </div>

        {/* Rating */}
        <div className="flex flex-col items-center gap-2">
          <StarRating starSize={20} rate={rating || 0} />
          <span className="text-sm text-secondary">
            ({reviewCount} recenzji)
          </span>
        </div>

        {/* Contact Form Card */}
        <div className="border border-[#3B3634] rounded-sm p-4 bg-primary">
          <h3 className="heading-md uppercase mb-4 text-xs tracking-wider text-center">
            Napisz do {name}
          </h3>
          <MessageForm
            seller_id={id}
            seller_name={name}
            isAuthenticated={!!user}
            compact={true}
          />
        </div>

        {/* Footer Info */}
        <div className="border-t pt-4 space-y-3">
          <p className="text-md text-secondary">
            Dołączył {format(new Date(created_at), "yyyy-MM-dd")}
          </p>
          <button
            onClick={() => setOpenReportModal(true)}
            className="group relative w-full overflow-hidden uppercase text-md button-text px-0 py-2 transition-all duration-300 ease-in-out"
          >
            <span className="relative z-10 block translate-x-0 text-[#3B3634] text-left transition-all duration-300 ease-in-out group-hover:translate-x-[calc(50%-1.25rem)] group-hover:text-white">
              Zgłoś
            </span>
            <span className="absolute inset-0 -z-0 scale-x-0 bg-[#3B3634] transition-transform duration-300 ease-in-out group-hover:scale-x-100" />
          </button>
        </div>
      </div>

      {/* Report Modal - Shared */}
      {openReportModal && (
        <Modal
          heading="Zgłoś sprzedawcę"
          onClose={() => setOpenReportModal(false)}
        >
          <ReportSellerForm
            seller_id={id}
            onClose={() => setOpenReportModal(false)}
          />
        </Modal>
      )}
    </>
  )
}