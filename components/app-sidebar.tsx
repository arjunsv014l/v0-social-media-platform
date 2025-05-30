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
import { Home, GraduationCap, Briefcase, Building2, LogOut } from "lucide-react"
import { useMemo } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<any>
  userTypes: string[]
}

const allNavigationItems: NavItem[] = [
  {
    label: "Home",
    href: "/",
    icon: Home,
    userTypes: ["all"],
  },
  {
    label: "Student Dashboard",
    href: "/student",
    icon: GraduationCap,
    userTypes: ["student"],
  },
  {
    label: "University Portal",
    href: "/university",
    icon: Building2,
    userTypes: ["university"],
  },
  {
    label: "Corporate Portal",
    href: "/corporate",
    icon: Briefcase,
    userTypes: ["corporate"],
  },
  {
    label: "Professional Hub",
    href: "/professional",
    icon: Briefcase,
    userTypes: ["professional"],
  },
]

interface AppSidebarProps {
  className?: string
}

export function AppSidebar({ className }: AppSidebarProps) {
  const { user, profile, loading: authLoading, signOutUser } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  const sidebarTitle = useMemo(() => {
    switch (profile?.user_type) {
      case "student":
        return profile?.full_name || "Student Dashboard"
      case "university":
        return `${profile?.affiliated_college || "University"} Portal`
      case "corporate":
        return `${profile?.company_name || "Corporate"} Portal`
      case "professional":
        return profile?.full_name || "Professional Hub"
      default:
        return "Dashboard"
    }
  }, [profile])

  const filteredNavigationItems = useMemo(() => {
    return allNavigationItems.filter(
      (item) => item.userTypes.includes(profile?.user_type || "") || item.userTypes.includes("all"),
    )
  }, [profile])

  // Enhanced loading check
  if (authLoading || !profile) {
    return (
      <aside
        className={cn("fixed inset-y-0 left-0 z-50 hidden w-60 flex-col border-r bg-background sm:flex", className)}
      >
        <div className="flex h-16 shrink-0 items-center border-b px-6">
          {/* Consider a more specific logo/placeholder if available */}
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {" "}
          {/* Changed nav to div for skeleton layout */}
          <div className="space-y-1">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-9 w-full rounded-md" />
            ))}
          </div>
        </div>
        <div className="mt-auto border-t p-4">
          <Skeleton className="h-9 w-full rounded-md" />
        </div>
      </aside>
    )
  }

  return (
    <aside className={cn("fixed inset-y-0 left-0 z-50 hidden w-60 flex-col border-r bg-background sm:flex", className)}>
      <div className="flex h-16 shrink-0 items-center border-b px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Avatar className="h-8 w-8">
            <AvatarImage src={profile?.image_url || ""} alt={profile?.full_name || "Avatar"} />
            <AvatarFallback>{profile?.full_name?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
          <span>{sidebarTitle}</span>
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-1">
          {filteredNavigationItems.map((item) => (
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-start gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={profile?.image_url || ""} alt={profile?.full_name || "Avatar"} />
                <AvatarFallback>{profile?.full_name?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
              <span>
                {profile?.full_name}
                <br />
                <span className="text-xs text-muted-foreground">{user?.email}</span>
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => {
                signOutUser()
                router.push("/login")
              }}
              className="cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  )
}
