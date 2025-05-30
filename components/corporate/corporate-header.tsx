"use client"

import { Button } from "@/components/ui/button"
import { BellIcon, MessageSquareIcon, SearchIcon } from "lucide-react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"
import { NotificationsPopover } from "@/components/notifications-popover"
import { useState } from "react"

export function CorporateHeader() {
  const { profile } = useAuth()
  const [isNotificationsPopoverOpen, setIsNotificationsPopoverOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="md:hidden" />
        <div className="hidden md:block">
          <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Corporate Dashboard
          </h1>
        </div>
      </div>
      <div className="relative hidden md:block">
        <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <input
          type="search"
          placeholder="Search candidates, jobs, applications..."
          className="h-9 w-64 rounded-full border border-input bg-background pl-8 pr-4 text-sm focus:outline-none"
        />
      </div>
      <div className="flex items-center gap-2">
        <Button size="icon" variant="ghost" className="md:hidden">
          <SearchIcon className="h-5 w-5" />
          <span className="sr-only">Search</span>
        </Button>

        <NotificationsPopover open={isNotificationsPopoverOpen} onOpenChange={setIsNotificationsPopoverOpen}>
          <Button size="icon" variant="ghost" className="relative">
            <BellIcon className="h-5 w-5" />
            <span className="sr-only">Notifications</span>
          </Button>
        </NotificationsPopover>

        <Link href="/messages">
          <Button size="icon" variant="ghost" className="relative">
            <MessageSquareIcon className="h-5 w-5" />
            <span className="sr-only">Messages</span>
          </Button>
        </Link>

        <Link href="/corporate/profile">
          <Button size="sm" variant="ghost" className="relative h-9 w-9 rounded-full p-0">
            <img
              src={profile?.avatar_url || "/placeholder.svg?height=36&width=36&query=corporate logo"}
              alt={profile?.company_name || profile?.full_name || "Profile"}
              className="h-full w-full rounded-full object-cover"
            />
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 ring-1 ring-background" />
            <span className="sr-only">Profile</span>
          </Button>
        </Link>
      </div>
    </header>
  )
}
