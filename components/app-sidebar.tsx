"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
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

const navigationItems = [
  {
    title: "Home",
    url: "/",
    icon: HomeIcon,
  },
  {
    title: "Profile",
    url: "/profile",
    icon: UserIcon,
  },
  {
    title: "Friends",
    url: "/friends",
    icon: UsersIcon,
    badge: "3",
  },
  {
    title: "Messages",
    url: "/messages",
    icon: MessageSquareIcon,
    badge: "2",
  },
  {
    title: "Events",
    url: "/events",
    icon: CalendarIcon,
  },
  {
    title: "Courses",
    url: "/courses",
    icon: BookOpenIcon,
  },
]

const quickActions = [
  {
    title: "Create Post",
    icon: PlusIcon,
    action: () => alert("Create post modal would open here! ✨"),
  },
  {
    title: "Search",
    icon: SearchIcon,
    action: () => alert("Search modal would open here! 🔍"),
  },
  {
    title: "Notifications",
    icon: BellIcon,
    badge: "5",
    action: () => alert("Notifications panel would open here! 🔔"),
  },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar variant="inset" className="border-r-0">
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
                      {item.badge && (
                        <Badge variant="secondary" className="ml-auto h-5 w-5 rounded-full p-0 text-xs">
                          {item.badge}
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
              {quickActions.map((action) => (
                <SidebarMenuItem key={action.title}>
                  <SidebarMenuButton onClick={action.action}>
                    <action.icon className="h-4 w-4" />
                    <span>{action.title}</span>
                    {action.badge && (
                      <Badge variant="secondary" className="ml-auto h-5 w-5 rounded-full p-0 text-xs">
                        {action.badge}
                      </Badge>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
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
            <div className="flex items-center gap-3 px-2 py-1.5">
              <div className="relative">
                <img
                  src="/placeholder.svg?height=32&width=32&query=student profile"
                  alt="Profile"
                  className="h-8 w-8 rounded-full object-cover"
                />
                <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 ring-1 ring-sidebar-background" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Michael Turner</span>
                <span className="truncate text-xs text-sidebar-foreground/70">@michael_t</span>
              </div>
            </div>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => alert("Logout functionality would be implemented here! 👋")}>
              <LogOutIcon className="h-4 w-4" />
              <span>Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
