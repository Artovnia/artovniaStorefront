import { SellerInfo } from "@/components/molecules"
import { SellerProps } from "@/types/seller"
import { HttpTypes } from "@medusajs/types"
import { SellerMessageTab } from "@/components/cells/SellerMessageTab/SellerMessageTab"

export const SellerHeading = ({
  seller,
  user,
}: {
  seller: SellerProps
  user: HttpTypes.StoreCustomer | null
}) => {
  return (
    <div className="flex justify-between flex-col lg:flex-row">
      <SellerInfo seller={seller} />
      {user && (
        <div className="flex items-center gap-2 mt-4 lg:mt-0">
          <SellerMessageTab
            seller_id={seller.id}
            seller_name={seller.name}
            isAuthenticated={user !== null}
          />
        </div>
      )}
    </div>
  )
}
