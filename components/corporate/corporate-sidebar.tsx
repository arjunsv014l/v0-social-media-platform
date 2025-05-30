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
  Building2,
  Briefcase,
  GraduationCap,
  FileText,
  Settings,
  LogOut,
  MessageSquare,
  LineChart,
} from "lucide-react"
import { usePathname } from "next/navigation"

export function CorporateSidebar() {
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
                src={profile?.avatar_url || "/placeholder.svg?height=32&width=32&query=corporate logo"}
                alt={profile?.company_name || "Company"}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">{profile?.company_name || "Company"}</span>
              <span className="text-xs text-muted-foreground">{profile?.industry || "Corporate"}</span>
            </div>
          </div>
        </SidebarHeader>
        <SidebarSeparator />
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/corporate/dashboard")}>
                <Link href="/corporate/dashboard">
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/corporate/jobs")}>
                <Link href="/corporate/jobs">
                  <Briefcase className="h-4 w-4" />
                  <span>Job Postings</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/corporate/internships")}>
                <Link href="/corporate/internships">
                  <GraduationCap className="h-4 w-4" />
                  <span>Internships</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/corporate/applications")}>
                <Link href="/corporate/applications">
                  <FileText className="h-4 w-4" />
                  <span>Applications</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/corporate/candidates")}>
                <Link href="/corporate/candidates">
                  <Users className="h-4 w-4" />
                  <span>Candidates</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/corporate/analytics")}>
                <Link href="/corporate/analytics">
                  <LineChart className="h-4 w-4" />
                  <span>Analytics</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <SidebarSeparator />
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/corporate/company")}>
                <Link href="/corporate/company">
                  <Building2 className="h-4 w-4" />
                  <span>Company Profile</span>
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
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/corporate/settings")}>
                <Link href="/corporate/settings">
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
