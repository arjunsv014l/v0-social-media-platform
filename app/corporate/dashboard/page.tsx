"use client"

import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Loader2, Users, Briefcase, TrendingUp, Calendar, Building, Target } from "lucide-react"

export default function CorporateDashboard() {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <SidebarInset>
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="md:hidden" />
          <div className="hidden md:block">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Corporate Dashboard 🏢
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {profile && (
            <div className="flex items-center gap-2">
              <img
                src={profile.avatar_url || "/placeholder.svg?height=32&width=32&query=corporate"}
                alt={profile.full_name || "Profile"}
                className="h-8 w-8 rounded-full object-cover"
              />
              <span className="hidden md:block text-sm font-medium">{profile.full_name}</span>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 p-4">
        <div className="mx-auto max-w-6xl space-y-6">
          {/* Welcome Section */}
          <div className="space-y-2">
            <h2 className="text-3xl font-bold">Welcome to {profile?.company || "Your Company"}! 🚀</h2>
            <p className="text-muted-foreground">Connect with talented students and build your future workforce.</p>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Job Posts</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">7</div>
                <p className="text-xs text-muted-foreground">+2 this week</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Applications</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">156</div>
                <p className="text-xs text-muted-foreground">+23 this week</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Interviews Scheduled</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">Next 7 days</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Talent Pipeline</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">89</div>
                <p className="text-xs text-muted-foreground">Qualified candidates</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Recent Recruitment Activities */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Recruitment Activities</CardTitle>
                  <CardDescription>Latest updates on your hiring process</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">New application for Software Engineer Intern</p>
                      <p className="text-xs text-muted-foreground">From Emily Johnson - Computer Science, MIT</p>
                    </div>
                    <div className="text-xs text-muted-foreground">1 hour ago</div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                      <Calendar className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Interview scheduled with David Kim</p>
                      <p className="text-xs text-muted-foreground">Product Manager Intern position</p>
                    </div>
                    <div className="text-xs text-muted-foreground">3 hours ago</div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                      <Briefcase className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Job post published: Data Analyst Intern</p>
                      <p className="text-xs text-muted-foreground">Summer 2024 program</p>
                    </div>
                    <div className="text-xs text-muted-foreground">1 day ago</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <Briefcase className="mr-2 h-4 w-4" />
                    Post New Job
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Users className="mr-2 h-4 w-4" />
                    Browse Talent
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Calendar className="mr-2 h-4 w-4" />
                    Schedule Interviews
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Target className="mr-2 h-4 w-4" />
                    Campus Events
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Company Profile</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{profile?.company || "Your Company"}</span>
                      <Building className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{profile?.industry || "Technology"}</span>
                      <span className="text-xs text-muted-foreground">Industry</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{profile?.company_size || "50-200"} employees</span>
                      <span className="text-xs text-muted-foreground">Size</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </SidebarInset>
  )
}
