"use client"

import { Skeleton } from "@/components/ui/skeleton"

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
  BriefcaseIcon,
  BuildingIcon,
  LayoutDashboardIcon,
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
import { useEffect, useState, useMemo } from "react"
import { supabase } from "@/lib/supabase/client"
import { CreatePostDialog } from "@/components/create-post-dialog"
import { SearchDialog } from "@/components/search-dialog"
import { NotificationsPopover } from "@/components/notifications-popover"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { LucideIcon } from "lucide-react"
import type { Profile } from "@/types/profile" // Import Profile type

interface NavItem {
  title: string
  url: string
  icon: LucideIcon
  badgeKey?: keyof BadgesState
  userTypes: Array<Profile["user_type"] | "all"> // 'all' for items visible to everyone logged in
}

interface BadgesState {
  friendRequests: number
  unreadMessages: number
  notifications: number
}

const allNavigationItems: NavItem[] = [
  // Student & General
  { title: "Home Feed", url: "/", icon: HomeIcon, userTypes: ["student"] },
  { title: "My Profile", url: "/profile", icon: UserIcon, userTypes: ["all"] },
  {
    title: "Friends",
    url: "/friends",
    icon: UsersIcon,
    badgeKey: "friendRequests",
    userTypes: ["student", "professional"],
  },
  { title: "Messages", url: "/messages", icon: MessageSquareIcon, badgeKey: "unreadMessages", userTypes: ["all"] },
  { title: "Events", url: "/events", icon: CalendarIcon, userTypes: ["student", "professional"] },
  { title: "Courses", url: "/courses", icon: BookOpenIcon, userTypes: ["student"] }, // General course discovery
  { title: "Create Content", url: "/create", icon: VideoIcon, userTypes: ["student", "professional"] },

  // University
  { title: "University Dashboard", url: "/university/dashboard", icon: LayoutDashboardIcon, userTypes: ["university"] },
  // Potentially add more university specific links here like "Manage Courses", "Student Directory" if they are separate pages

  // Professional
  { title: "Professional Dashboard", url: "/professional/dashboard", icon: BriefcaseIcon, userTypes: ["professional"] },

  // Corporate
  { title: "Corporate Dashboard", url: "/corporate/dashboard", icon: BuildingIcon, userTypes: ["corporate"] },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { user, profile, signOut, loading: authLoading } = useAuth()
  const { setTheme } = useTheme()

  const [badges, setBadges] = useState<BadgesState>({
    friendRequests: 0,
    unreadMessages: 0,
    notifications: 0,
  })
  const [createPostOpen, setCreatePostOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [isNotificationsPopoverOpen, setIsNotificationsPopoverOpen] = useState(false)
  const [loadingSignOut, setLoadingSignOut] = useState(false)

  const filteredNavigationItems = useMemo(() => {
    if (!profile?.user_type) return []
    return allNavigationItems.filter(
      (item) => item.userTypes.includes(profile.user_type!) || item.userTypes.includes("all"),
    )
  }, [profile?.user_type])

  useEffect(() => {
    if (!user || authLoading) return

    const fetchBadgeData = async (type: keyof BadgesState) => {
      if (!user?.id) return // Ensure user.id is available
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
      const { count, error } = await query
      if (error) console.error(`Error fetching ${type} count:`, error)
      else setBadges((prev) => ({ ...prev, [type]: count || 0 }))
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
        () => fetchBadgeData("notifications"),
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channels)
    }
  }, [user, authLoading])

  const handleSignOut = async () => {
    setLoadingSignOut(true)
    await signOut()
    // setLoadingSignOut(false); // AuthContext handles redirect and loading state changes
  }

  if (pathname === "/login" || pathname === "/signup") {
    return null
  }

  if (authLoading || (!user && !profile)) {
    // Show loader if auth is loading or if user/profile not yet available
    return (
      <Sidebar variant="inset" className="border-r-0">
        <SidebarHeader className="border-b border-sidebar-border">
          <div className="flex items-center gap-2 px-4 py-2">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <div className="grid flex-1 text-left text-sm leading-tight">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32 mt-1" />
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent className="p-4">
          <Skeleton className="h-8 w-full mb-2" />
          <Skeleton className="h-8 w-full mb-2" />
          <Skeleton className="h-8 w-full mb-2" />
        </SidebarContent>
      </Sidebar>
    )
  }

  const QuickActions = () => (
    <SidebarGroup>
      <SidebarGroupLabel>Quick Actions</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {profile?.user_type === "student" && (
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => setCreatePostOpen(true)}>
                <PlusIcon className="h-4 w-4" />
                <span>Create Post</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
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
  )

  return (
    <>
      <Sidebar variant="inset" className="border-r-0">
        <SidebarHeader className="border-b border-sidebar-border">
          <div className="flex items-center gap-2 px-4 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-purple-600">
              {profile?.user_type === "university" ? (
                <BuildingIcon className="h-4 w-4 text-white" />
              ) : (
                <GraduationCapIcon className="h-4 w-4 text-white" />
              )}
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">
                {profile?.user_type === "university"
                  ? profile.affiliated_college || "University Portal"
                  : profile?.user_type === "corporate"
                    ? profile.company_name || "Corporate Portal"
                    : profile?.user_type === "professional"
                      ? "Professional Space"
                      : "CampusConnect"}
              </span>
              <span className="truncate text-xs text-sidebar-foreground/70">
                {profile?.user_type
                  ? `${profile.user_type.charAt(0).toUpperCase() + profile.user_type.slice(1)} View`
                  : "Social Network"}
              </span>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          {filteredNavigationItems.length > 0 && (
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {filteredNavigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={pathname === item.url}>
                        <Link href={item.url}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                          {item.badgeKey && badges[item.badgeKey] > 0 && (
                            <Badge variant="secondary" className="ml-auto h-5 w-5 rounded-full p-0 text-xs">
                              {badges[item.badgeKey]}
                            </Badge>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}

          <QuickActions />

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
                      src={profile.avatar_url || "/placeholder.svg?height=32&width=32&query=user profile"}
                      alt={profile.full_name || "User profile"}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                    {/* Online status indicator can be added here if needed */}
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{profile.full_name || "User"}</span>
                    <span className="truncate text-xs text-sidebar-foreground/70">
                      @{profile.username || (profile.user_type ? profile.user_type : "user")}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 px-2 py-1.5 h-[44px]">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-3 w-16 mt-1" />
                  </div>
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
