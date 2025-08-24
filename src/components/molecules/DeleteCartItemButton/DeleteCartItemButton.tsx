"use client"

import { Button } from "@/components/atoms"
import { BinIcon } from "@/icons"
import { useCart } from "@/lib/context/CartContext"
import { useState } from "react"

export const DeleteCartItemButton = ({ 
  id, 
  onDeleted 
}: { 
  id: string
  onDeleted?: () => void 
}) => {
  const [isDeleting, setIsDeleting] = useState(false)
  const { removeItem } = useCart()

  const handleDelete = async (id: string) => {
    try {
      setIsDeleting(true)
      await removeItem(id)
      
      // Notify parent component that deletion succeeded
      if (onDeleted) {
        onDeleted()
      }
    } catch (error) {
      console.error('❌ Failed to delete item:', error)
    } finally {
      setIsDeleting(false)
    }
  }
  return (
    <Button
      variant="text"
      className="w-10 h-10 flex items-center justify-center p-0"
      onClick={() => handleDelete(id)}
      loading={isDeleting}
      disabled={isDeleting}
    >
      <BinIcon size={20} />
    </Button>
  )
}
