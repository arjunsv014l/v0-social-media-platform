"use client"

import { useAuth } from "@/contexts/auth-context"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  LayoutDashboard,
  Users,
  Calendar,
  BookOpen,
  MessageSquare,
  Settings,
  LogOut,
  GraduationCap,
} from "lucide-react"
import { usePathname } from "next/navigation"

export function ProfessionalSidebar() {
  const { profile, signOut } = useAuth()
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 px-4 py-2">
            <div className="h-8 w-8 rounded-full overflow-hidden">
              <img
                src={profile?.avatar_url || "/placeholder.svg?height=32&width=32&query=professional"}
                alt={profile?.full_name || "Profile"}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">{profile?.full_name}</span>
              <span className="text-xs text-muted-foreground">{profile?.job_title || "Professional"}</span>
            </div>
          </div>
        </SidebarHeader>
        <SidebarSeparator />
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/professional/dashboard")}>
                <Link href="/professional/dashboard">
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/professional/mentees")}>
                <Link href="/professional/mentees">
                  <GraduationCap className="h-4 w-4" />
                  <span>Mentees</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/professional/meetings")}>
                <Link href="/professional/meetings">
                  <Calendar className="h-4 w-4" />
                  <span>Meetings</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/professional/content")}>
                <Link href="/professional/content">
                  <BookOpen className="h-4 w-4" />
                  <span>Content</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/professional/network")}>
                <Link href="/professional/network">
                  <Users className="h-4 w-4" />
                  <span>Network</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/messages")}>
                <Link href="/messages">
                  <MessageSquare className="h-4 w-4" />
                  <span>Messages</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <SidebarSeparator />
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/professional/settings")}>
                <Link href="/professional/settings">
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <Button variant="ghost" className="w-full justify-start" onClick={() => signOut()}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </SidebarFooter>
      </Sidebar>
    </SidebarProvider>
  )
}
