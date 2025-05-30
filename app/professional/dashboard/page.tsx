"use client"

import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Loader2, Users, MessageSquare, Calendar, TrendingUp, Award, BookOpen } from "lucide-react"

export default function ProfessionalDashboard() {
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
              Professional Dashboard 💼
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {profile && (
            <div className="flex items-center gap-2">
              <img
                src={profile.avatar_url || "/placeholder.svg?height=32&width=32&query=professional"}
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
            <h2 className="text-3xl font-bold">Welcome back, {profile?.full_name?.split(" ")[0]}! 👋</h2>
            <p className="text-muted-foreground">Ready to mentor students and share your expertise?</p>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Students Mentored</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">+2 from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Conversations</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8</div>
                <p className="text-xs text-muted-foreground">3 new messages</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Upcoming Sessions</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">5</div>
                <p className="text-xs text-muted-foreground">This week</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Impact Score</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">94</div>
                <p className="text-xs text-muted-foreground">+5% from last month</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Recent Mentoring Activities */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Mentoring Activities</CardTitle>
                  <CardDescription>Your latest interactions with students</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Mentoring session with Sarah Chen</p>
                      <p className="text-xs text-muted-foreground">Career guidance in Software Engineering</p>
                    </div>
                    <div className="text-xs text-muted-foreground">2 hours ago</div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                      <MessageSquare className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Answered question about React development</p>
                      <p className="text-xs text-muted-foreground">From Alex Rodriguez</p>
                    </div>
                    <div className="text-xs text-muted-foreground">5 hours ago</div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                      <Award className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Received 5-star rating from mentee</p>
                      <p className="text-xs text-muted-foreground">From Maria Garcia</p>
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
                    <Users className="mr-2 h-4 w-4" />
                    Find Students to Mentor
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Calendar className="mr-2 h-4 w-4" />
                    Schedule Mentoring Session
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Share Knowledge Article
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    View Messages
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Your Expertise</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{profile?.industry || "Technology"}</span>
                      <span className="text-xs text-muted-foreground">Primary</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{profile?.position || "Senior Engineer"}</span>
                      <span className="text-xs text-muted-foreground">Role</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{profile?.experience_years || "5+"} years</span>
                      <span className="text-xs text-muted-foreground">Experience</span>
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
