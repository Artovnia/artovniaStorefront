"use client"
import { UserNavigation } from "@/components/molecules"
import { ReactNode } from "react"

interface UserPageLayoutProps {
  children: ReactNode
  title?: string
  className?: string
}

export const UserPageLayout = ({ children, title, className = "" }: UserPageLayoutProps) => {
  return (
    <main className={`container ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-4 mt-6 gap-5 md:gap-8 pb-6">
        {/* Desktop Sidebar Navigation - Hidden on mobile */}
        <div className="hidden md:block">
          <UserNavigation />
        </div>
        
        {/* Main Content */}
        <div className="md:col-span-3">
          {title && (
            <h1 className="heading-md uppercase mb-8">{title}</h1>
          )}
          {children}
        </div>
      </div>
    </main>
  )
}
