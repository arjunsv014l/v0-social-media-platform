"use client"

import type React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/auth-context"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, LogOut, UserCircle, SettingsIcon, BookOpen, MessageSquare, Bell } from "lucide-react" // Added more icons
import { useMemo } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<any>
}

interface AppSidebarProps {
  className?: string
}

export function AppSidebar({ className }: AppSidebarProps) {
  const { user, profile, loading: authLoading, signOut } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  const sidebarTitle = useMemo(() => {
    if (!profile) return "Dashboard"
    switch (profile.user_type) {
      case "student":
        return profile.full_name || "Student Dashboard"
      case "university":
        return `${profile.affiliated_college || "University"} Portal`
      case "corporate":
        return `${profile.company_name || "Corporate"} Portal`
      default:
        return "Dashboard"
    }
  }, [profile])

  const getDashboardPathForUser = () => {
    if (!profile) return "/"
    switch (profile.user_type) {
      case "student":
        return "/student/dashboard" // Updated for student dashboard
      case "corporate":
        return "/corporate/dashboard"
      case "university":
        return "/university/dashboard"
      default:
        return "/"
    }
  }

  const dashboardPath = getDashboardPathForUser()

  const navigationItems = useMemo((): NavItem[] => {
    if (!profile) return []

    const baseNavItems: NavItem[] = [
      {
        label: "My Dashboard",
        href: dashboardPath,
        icon: Home,
      },
    ]

    // Add student-specific navigation items if the user is a student
    // and they are on their student dashboard or related student pages
    if (profile.user_type === "student") {
      baseNavItems.push(
        {
          label: "Courses",
          href: "/courses", // Assuming a general courses page
          icon: BookOpen,
        },
        {
          label: "Messages",
          href: "/messages", // Assuming a general messages page
          icon: MessageSquare,
        },
        {
          label: "Notifications",
          href: "/notifications", // Assuming a general notifications page
          icon: Bell,
        },
      )
    }
    // You can add more role-specific items here for university/corporate users if needed

    return baseNavItems
  }, [profile, dashboardPath])

  if (authLoading) {
    return (
      <aside
        className={cn("fixed inset-y-0 left-0 z-50 hidden w-60 flex-col border-r bg-background sm:flex", className)}
      >
        <div className="flex h-16 shrink-0 items-center border-b px-6">
          <Skeleton className="h-8 w-32" />
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {[...Array(5)].map(
              (
                _,
                i, // Increased skeleton items to match potential nav items
              ) => (
                <Skeleton key={i} className="h-10 w-full rounded-md" />
              ),
            )}
          </div>
        </div>
        <div className="mt-auto border-t p-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        </div>
      </aside>
    )
  }

  if (!profile && !authLoading) {
    // Optionally, you could redirect to login or show a minimal sidebar
    return null // Or a more specific placeholder if not logged in
  }

  return (
    <aside className={cn("fixed inset-y-0 left-0 z-50 hidden w-60 flex-col border-r bg-background sm:flex", className)}>
      <div className="flex h-16 shrink-0 items-center border-b px-6">
        <Link href={dashboardPath} className="flex items-center gap-2 font-semibold">
          <Avatar className="h-8 w-8">
            <AvatarImage src={profile?.avatar_url || ""} alt={profile?.full_name || "User"} />
            <AvatarFallback>{profile?.full_name?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
          </Avatar>
          <span className="truncate">{sidebarTitle}</span>
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-1">
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                pathname === item.href ? "bg-accent text-accent-foreground" : "text-muted-foreground",
              )}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
      <div className="mt-auto border-t p-4">
        {user && profile && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start gap-2 text-left h-auto py-2">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={profile.avatar_url || ""} alt={profile.full_name || "User"} />
                  <AvatarFallback>{profile.full_name?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col truncate">
                  <span className="text-sm font-medium truncate">{profile.full_name}</span>
                  <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => router.push("/profile")} className="cursor-pointer">
                <UserCircle className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => router.push("/settings")} className="cursor-pointer">
                <SettingsIcon className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => {
                  if (typeof signOut === "function") {
                    signOut()
                    router.push("/login")
                  } else {
                    console.error("SignOut function is not available on AuthContext")
                  }
                }}
                className="cursor-pointer text-red-600 hover:!text-red-600 focus:!text-red-600 hover:!bg-red-50 focus:!bg-red-50 dark:hover:!bg-red-900/50 dark:focus:!bg-red-900/50 dark:text-red-500 dark:hover:!text-red-500 dark:focus:!text-red-500"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </aside>
  )
}
