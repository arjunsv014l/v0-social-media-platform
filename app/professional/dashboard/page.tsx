"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SidebarInset } from "@/components/ui/sidebar"
import { ProfessionalHeader } from "@/components/professional/professional-header"
import { ProfessionalSidebar } from "@/components/professional/professional-sidebar"
import { Users, BookOpen, Calendar, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import type { Profile } from "@/lib/supabase/types"

export default function ProfessionalDashboard() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const [mentorshipRequests, setMentorshipRequests] = useState(0)
  const [upcomingMeetings, setUpcomingMeetings] = useState(0)
  const [connectedStudents, setConnectedStudents] = useState<Profile[]>([])
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
      return
    }

    if (profile && profile.user_type !== "professional") {
      // Redirect to appropriate dashboard based on user type
      router.push(profile.user_type === "corporate" ? "/corporate/dashboard" : "/")
      return
    }

    const fetchDashboardData = async () => {
      if (!user) return

      try {
        setLoadingData(true)

        // Fetch mentorship requests (placeholder)
        setMentorshipRequests(Math.floor(Math.random() * 5) + 1)

        // Fetch upcoming meetings (placeholder)
        setUpcomingMeetings(Math.floor(Math.random() * 3))

        // Fetch connected students
        const { data: connections } = await supabase
          .from("friendships")
          .select("friend_id")
          .eq("user_id", user.id)
          .eq("status", "accepted")
          .limit(5)

        if (connections && connections.length > 0) {
          const friendIds = connections.map((c) => c.friend_id)
          const { data: students } = await supabase
            .from("profiles")
            .select("*")
            .in("id", friendIds)
            .eq("user_type", "student")
            .limit(5)

          setConnectedStudents((students as Profile[]) || [])
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoadingData(false)
      }
    }

    fetchDashboardData()
  }, [user, profile, loading, router])

  if (loading || loadingData) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <>
      <ProfessionalSidebar />
      <SidebarInset>
        <ProfessionalHeader />

        <main className="flex-1 p-6">
          <div className="mx-auto max-w-6xl space-y-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Professional Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome back, {profile?.full_name}. Here's what's happening with your mentorship activities.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Mentorship Requests</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mentorshipRequests}</div>
                  <p className="text-xs text-muted-foreground">+{Math.floor(Math.random() * 10)}% from last week</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Upcoming Meetings</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{upcomingMeetings}</div>
                  <p className="text-xs text-muted-foreground">For this week</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Connected Students</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{connectedStudents.length}</div>
                  <p className="text-xs text-muted-foreground">Active mentoring relationships</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Content Created</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{Math.floor(Math.random() * 10)}</div>
                  <p className="text-xs text-muted-foreground">Articles and resources shared</p>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="mentees">
              <TabsList className="grid w-full grid-cols-3 md:w-auto">
                <TabsTrigger value="mentees">Mentees</TabsTrigger>
                <TabsTrigger value="meetings">Meetings</TabsTrigger>
                <TabsTrigger value="content">Content</TabsTrigger>
              </TabsList>

              <TabsContent value="mentees" className="space-y-4 mt-6">
                <h2 className="text-xl font-semibold">Your Mentees</h2>
                {connectedStudents.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {connectedStudents.map((student) => (
                      <Card key={student.id}>
                        <CardHeader className="flex flex-row items-center gap-4">
                          <div className="h-12 w-12 rounded-full overflow-hidden">
                            <img
                              src={student.avatar_url || "/placeholder.svg?height=48&width=48&query=student"}
                              alt={student.full_name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div>
                            <CardTitle className="text-base">{student.full_name}</CardTitle>
                            <CardDescription>
                              {student.university || "University Student"} • {student.major || "Major"}
                            </CardDescription>
                          </div>
                        </CardHeader>
                        <CardFooter>
                          <Button variant="outline" size="sm" className="w-full">
                            Message
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="p-8 text-center">
                    <CardContent className="pt-4 pb-6">
                      <Users className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                      <h3 className="mt-4 text-lg font-medium">No mentees yet</h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        You don't have any mentees yet. Start connecting with students to build your mentoring network.
                      </p>
                    </CardContent>
                    <CardFooter className="flex justify-center">
                      <Button>Find Students to Mentor</Button>
                    </CardFooter>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="meetings" className="space-y-4 mt-6">
                <h2 className="text-xl font-semibold">Upcoming Meetings</h2>
                <Card className="p-8 text-center">
                  <CardContent className="pt-4 pb-6">
                    <Calendar className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                    <h3 className="mt-4 text-lg font-medium">No upcoming meetings</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      You don't have any scheduled meetings. Schedule a meeting with your mentees.
                    </p>
                  </CardContent>
                  <CardFooter className="flex justify-center">
                    <Button>Schedule Meeting</Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="content" className="space-y-4 mt-6">
                <h2 className="text-xl font-semibold">Your Content</h2>
                <Card className="p-8 text-center">
                  <CardContent className="pt-4 pb-6">
                    <BookOpen className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                    <h3 className="mt-4 text-lg font-medium">No content yet</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      You haven't created any content yet. Share your expertise with students.
                    </p>
                  </CardContent>
                  <CardFooter className="flex justify-center">
                    <Button>Create Content</Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </SidebarInset>
    </>
  )
}
