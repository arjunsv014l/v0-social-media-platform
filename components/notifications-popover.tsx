"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { BellIcon } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase/client"
import { formatDistanceToNow } from "date-fns"

interface NotificationsPopoverProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  triggerElement?: React.ReactNode
}

export function NotificationsPopover({ open, onOpenChange, triggerElement }: NotificationsPopoverProps) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const fetchNotifications = async () => {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10)

      setNotifications(data || [])
      setLoading(false)
    }

    fetchNotifications()

    // Subscribe to new notifications
    const subscription = supabase
      .channel("user-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setNotifications((prev) => [payload.new as any, ...prev])
        },
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [user])

  const markAsRead = async (notificationId: string) => {
    await supabase.from("notifications").update({ read: true }).eq("id", notificationId)

    setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)))
  }

  const markAllAsRead = async () => {
    if (!user) return

    await supabase.from("notifications").update({ read: true }).eq("user_id", user.id).eq("read", false)

    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const trigger = triggerElement || (
    <Button variant="ghost" size="icon" className="relative">
      <BellIcon className="h-5 w-5" />
      {notifications.filter((n) => !n.read).length > 0 && (
        <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
          {notifications.filter((n) => !n.read).length}
        </span>
      )}
    </Button>
  )

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Notifications</h3>
          {notifications.filter((n) => !n.read).length > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs">
              Mark all as read
            </Button>
          )}
        </div>
        <ScrollArea className="h-[400px]">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No notifications yet</div>
          ) : (
            <div className="space-y-2">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    notification.read ? "bg-background" : "bg-accent"
                  }`}
                  onClick={() => !notification.read && markAsRead(notification.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{notification.title}</p>
                      <p className="text-sm text-muted-foreground mt-1">{notification.content}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="ml-2">
                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
