"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button" // Keep for "Mark all as read"
import { useAuth } from "@/context/AuthContext"
import { supabase } from "@/lib/supabase/client"
import { formatDistanceToNow } from "date-fns"
import { Loader2 } from "lucide-react"

interface NotificationsPopoverProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode // This will be the trigger element
}

export function NotificationsPopover({ open, onOpenChange, children }: NotificationsPopoverProps) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      setNotifications([])
      return
    }

    setLoading(true)
    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20) // Increased limit slightly

      if (error) {
        console.error("Error fetching notifications:", error)
        setNotifications([])
      } else {
        setNotifications(data || [])
      }
      setLoading(false)
    }

    fetchNotifications()

    const subscription = supabase
      .channel(`notifications-${user.id}`) // User-specific channel
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setNotifications((prev) => [payload.new as any, ...prev].slice(0, 20)) // Keep list size manageable
          // Potentially update badge count here or via a separate mechanism
        },
      )
      .on(
        // Also listen for updates (e.g., read status changed elsewhere)
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setNotifications((prev) => prev.map((n) => (n.id === payload.new.id ? (payload.new as any) : n)))
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [user])

  const markAsRead = async (notificationId: string) => {
    if (!user) return
    // Optimistically update UI
    setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)))
    try {
      await supabase.from("notifications").update({ read: true }).eq("id", notificationId).eq("user_id", user.id)
    } catch (error) {
      console.error("Error marking notification as read:", error)
      // Revert optimistic update if error (optional)
    }
  }

  const markAllAsRead = async () => {
    if (!user || notifications.filter((n) => !n.read).length === 0) return

    // Optimistically update UI
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    try {
      await supabase.from("notifications").update({ read: true }).eq("user_id", user.id).eq("read", false)
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
      // Revert optimistic update if error (optional)
    }
  }

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-lg">Notifications</h3>
          {notifications.filter((n) => !n.read).length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs text-primary hover:bg-primary/10"
            >
              Mark all as read
            </Button>
          )}
        </div>
        <ScrollArea className="h-[400px]">
          {loading ? (
            <div className="flex justify-center items-center h-full py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <img src="/empty-notification-bell.png" alt="No notifications" className="mx-auto mb-4 opacity-50" />
              You're all caught up!
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 cursor-pointer transition-colors hover:bg-muted/50 ${
                    notification.read ? "opacity-70" : "bg-accent/50 dark:bg-accent/20"
                  }`}
                  onClick={() => !notification.read && markAsRead(notification.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${!notification.read ? "font-semibold" : ""}`}>
                        {notification.title}
                      </p>
                      <p className="text-sm text-muted-foreground mt-0.5">{notification.content}</p>
                      <p className="text-xs text-muted-foreground mt-1.5">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="ml-2 mt-0.5">
                        <div className="h-2.5 w-2.5 rounded-full bg-primary" />
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
