"use client"
import { Card, Divider, LogoutButton, NavigationItem } from "@/components/atoms"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { getUnreadMessagesCount } from "@/lib/data/actions/messages"

// Bell Icon component for unread messages indicator
const BellIcon = ({ className = "" }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="16" 
    height="16" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
  </svg>
)

const defaultNavigationItems = [
  {
    label: "Zamówienia",
    href: "/user/orders",
  },
  {
    label: "Zwroty",
    href: "/user/returns",
  },
  {
    label: "Wiadomości",
    href: "/user/messages",
    hasNotification: true,
  },
  {
    label: "Adresy",
    href: "/user/addresses",
  },
  {
    label: "Recenzje",
    href: "/user/reviews",
  },
  {
    label: "Lista życzeń",
    href: "/user/wishlist",
  },
]

interface NavItem {
  label: string;
  href: string;
  hasNotification?: boolean;
}

export const UserNavigation = () => {
  const path = usePathname()
  const [navigationItems, setNavigationItems] = useState<NavItem[]>(defaultNavigationItems)
  const [hasUnreadMessages, setHasUnreadMessages] = useState<boolean>(false)
  
  // Fetch unread messages count
  useEffect(() => {
    const checkUnreadMessages = async () => {
      try {
        const unreadCount = await getUnreadMessagesCount()
        setHasUnreadMessages(unreadCount > 0)
        
        // Update navigation items to show notification icon if there are unread messages
        setNavigationItems(prevItems => 
          prevItems.map(item => {
            if (item.href === '/user/messages') {
              return { ...item, hasNotification: unreadCount > 0 }
            }
            return item
          })
        )
      } catch (error) {
      }
    }
    
    // Event handler for when messages are marked as read
    const handleMarkedAsRead = () => {
      // Force a refresh of the unread message count
      checkUnreadMessages()
    }
    
    // Check immediately on component mount
    checkUnreadMessages()
    
    // Set up interval to check periodically (every 30 seconds)
    const intervalId = setInterval(checkUnreadMessages, 30000)
    
    // Listen for custom event when a message thread is marked as read
    window.addEventListener('messages:marked-as-read', handleMarkedAsRead)
    
    // Clean up interval and event listener on component unmount
    return () => {
      clearInterval(intervalId)
      window.removeEventListener('messages:marked-as-read', handleMarkedAsRead)
    }
  }, [])

  return (
    <Card className="h-min">
      {navigationItems.map((item: NavItem) => (
        <NavigationItem
          key={item.label}
          href={item.href}
          active={path === item.href}
          hasNotification={item.hasNotification}
          prefetch={true}
        >
          {item.href === '/user/messages' && item.hasNotification ? (
            <span className="flex items-center gap-2">
              <BellIcon className="text-red-500 animate-pulse" />
              {item.label}
            </span>
          ) : (
            item.label
          )}
        </NavigationItem>
      ))}
      <Divider className="my-2" />
      <NavigationItem
        href={"/user/settings"}
        active={path === "/user/settings"}
        prefetch={true}
      >
        Ustawienia
      </NavigationItem>
      <LogoutButton className="w-full text-left" />
    </Card>
  )
}
