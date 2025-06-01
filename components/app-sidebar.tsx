"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import {
  BookOpenIcon,
  CalendarIcon,
  HomeIcon,
  UserIcon,
  UsersIcon,
  MessageSquareIcon,
  SettingsIcon,
  BellIcon,
  SearchIcon,
  PlusIcon,
  LogOutIcon,
  GraduationCapIcon,
  Loader2,
  SunIcon,
  MoonIcon,
  LaptopIcon,
  VideoIcon,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { CreatePostDialog } from "@/components/create-post-dialog"
import { SearchDialog } from "@/components/search-dialog"
import { NotificationsPopover } from "@/components/notifications-popover"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"

const navigationItems = [
  { title: "Home", url: "/", icon: HomeIcon },
  { title: "Profile", url: "/profile", icon: UserIcon },
  { title: "Friends", url: "/friends", icon: UsersIcon, badge: "friendRequests" },
  { title: "Messages", url: "/messages", icon: MessageSquareIcon, badge: "unreadMessages" },
  { title: "Events", url: "/events", icon: CalendarIcon },
  { title: "Courses", url: "/courses", icon: BookOpenIcon },
  { title: "Create", url: "/create", icon: VideoIcon },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { user, profile, signOut } = useAuth() // signOut is from AuthContext
  const { setTheme } = useTheme()
  const { toast } = useToast()

  const [badges, setBadges] = useState({ friendRequests: 0, unreadMessages: 0, notifications: 0 })
  const [createPostOpen, setCreatePostOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [isNotificationsPopoverOpen, setIsNotificationsPopoverOpen] = useState(false)
  const [loadingSignOut, setLoadingSignOut] = useState(false)

  useEffect(() => {
    if (!user) return
    const fetchBadgeData = async (type: keyof typeof badges) => {
      let query
      switch (type) {
        case "friendRequests":
          query = supabase
            .from("friendships")
            .select("*", { count: "exact", head: true })
            .eq("friend_id", user.id)
            .eq("status", "pending")
          break
        case "unreadMessages":
          query = supabase
            .from("messages")
            .select("*", { count: "exact", head: true })
            .eq("receiver_id", user.id)
            .eq("read", false)
          break
        case "notifications":
          query = supabase
            .from("notifications")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id)
            .eq("read", false)
          break
        default:
          return
      }
      const { count } = await query
      setBadges((prev) => ({ ...prev, [type]: count || 0 }))
    }
    fetchBadgeData("friendRequests")
    fetchBadgeData("unreadMessages")
    fetchBadgeData("notifications")
    const channels = supabase
      .channel(`realtime-badges-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "friendships", filter: `friend_id=eq.${user.id}` },
        () => fetchBadgeData("friendRequests"),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages", filter: `receiver_id=eq.${user.id}` },
        () => fetchBadgeData("unreadMessages"),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        (payload) => {
          if (payload.eventType === "INSERT" || (payload.eventType === "UPDATE" && payload.new.read === false))
            fetchBadgeData("notifications")
          else if (payload.eventType === "UPDATE" && payload.new.read === true) fetchBadgeData("notifications")
        },
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channels)
    }
  }, [user])

  const handleSignOut = async () => {
    setLoadingSignOut(true)
    try {
      await signOut() // Call the revised signOut from AuthContext
      // The redirection and state clearing are now primarily handled by AuthContext's reactive flow
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      })
    } catch (error: any) {
      console.error("AppSidebar: Error during sign out:", error)
      toast({
        title: "Sign Out Failed",
        description: error.message || "An unexpected error occurred during sign out.",
        variant: "destructive",
      })
    } finally {
      setLoadingSignOut(false)
    }
  }

  if (pathname === "/login" || pathname === "/signup") return null

  return (
    <>
      <Sidebar className="border-r-0">
        <SidebarHeader className="border-b border-sidebar-border">
          <div className="flex items-center gap-2 px-4 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-purple-600">
              <GraduationCapIcon className="h-4 w-4 text-white" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">CampusConnect</span>
              <span className="truncate text-xs text-sidebar-foreground/70">Student Social Network</span>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigationItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={pathname === item.url}>
                      <Link href={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                        {item.badge && badges[item.badge as keyof typeof badges] > 0 && (
                          <Badge variant="secondary" className="ml-auto h-5 w-5 rounded-full p-0 text-xs">
                            {badges[item.badge as keyof typeof badges]}
                          </Badge>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Quick Actions</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={() => setCreatePostOpen(true)}>
                    <PlusIcon className="h-4 w-4" />
                    <span>Create Post</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={() => setSearchOpen(true)}>
                    <SearchIcon className="h-4 w-4" />
                    <span>Search</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <NotificationsPopover open={isNotificationsPopoverOpen} onOpenChange={setIsNotificationsPopoverOpen}>
                    <SidebarMenuButton>
                      <BellIcon className="h-4 w-4" />
                      <span>Notifications</span>
                      {badges.notifications > 0 && (
                        <Badge variant="secondary" className="ml-auto h-5 w-5 rounded-full p-0 text-xs">
                          {badges.notifications}
                        </Badge>
                      )}
                    </SidebarMenuButton>
                  </NotificationsPopover>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Account</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === "/settings"}>
                    <Link href="/settings">
                      <SettingsIcon className="h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="border-t border-sidebar-border">
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="w-full justify-start px-2 py-1.5 h-auto text-sm">
                    <SunIcon className="h-[1.1rem] w-[1.1rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <MoonIcon className="absolute h-[1.1rem] w-[1.1rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="ml-2">Toggle Theme</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  side="top"
                  className="mb-1 w-[calc(var(--sidebar-width)_-_var(--sidebar-spacing-horizontal)_*_2)] sm:w-auto"
                >
                  <DropdownMenuItem onClick={() => setTheme("light")}>
                    <SunIcon className="mr-2 h-4 w-4" />
                    Light
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("dark")}>
                    <MoonIcon className="mr-2 h-4 w-4" />
                    Dark
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("system")}>
                    <LaptopIcon className="mr-2 h-4 w-4" />
                    System
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
            <SidebarMenuItem>
              {profile ? (
                <div className="flex items-center gap-3 px-2 py-1.5">
                  <div className="relative">
                    <img
                      src={profile.avatar_url || "/placeholder.svg?height=32&width=32&query=student profile"}
                      alt={profile.full_name || "User profile"}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                    <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 ring-1 ring-sidebar-background" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{profile.full_name || "Campus User"}</span>
                    <span className="truncate text-xs text-sidebar-foreground/70">@{profile.username || "user"}</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 px-2 py-1.5 h-[44px]">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Loading user...</span>
                </div>
              )}
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleSignOut} disabled={loadingSignOut}>
                {loadingSignOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOutIcon className="h-4 w-4" />}
                <span>Sign Out</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <CreatePostDialog open={createPostOpen} onOpenChange={setCreatePostOpen} />
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  )
}
