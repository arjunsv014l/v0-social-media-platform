"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Bell, UserPlus, MessageSquare, Calendar, Briefcase, Users, GraduationCap, Loader2 } from "lucide-react"
import Link from "next/link"
import { NotificationsPopover } from "@/components/notifications-popover"

export default function ProfessionalDashboard() {
  const { user, profile, loading } = useAuth()
  const [mentorships, setMentorships] = useState([])
  const [studentConnections, setStudentConnections] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      setIsLoading(true)

      // This would be replaced with actual data fetching
      // For demo purposes, we're generating sample data

      // Sample mentorships
      const sampleMentorships = [
        {
          id: 1,
          studentName: "Alex Johnson",
          university: "Stanford University",
          major: "Computer Science",
          status: "Active",
          startDate: "2023-09-01",
        },
        {
          id: 2,
          studentName: "Sophia Wang",
          university: "MIT",
          major: "Engineering",
          status: "Pending",
          startDate: null,
        },
        {
          id: 3,
          studentName: "Michael Brown",
          university: "Harvard University",
          major: "Business Administration",
          status: "Active",
          startDate: "2023-08-15",
        },
      ]

      // Sample student connections
      const sampleConnections = [
        { id: 1, name: "Alex Johnson", university: "Stanford University", major: "Computer Science" },
        { id: 2, name: "Sophia Wang", university: "MIT", major: "Engineering" },
        { id: 3, name: "Michael Brown", university: "Harvard University", major: "Business Administration" },
        { id: 4, name: "Emily Davis", university: "UCLA", major: "Psychology" },
      ]

      setMentorships(sampleMentorships)
      setStudentConnections(sampleConnections)

      setTimeout(() => {
        setIsLoading(false)
      }, 800) // Simulate loading
    }

    fetchData()
  }, [user])

  if (loading || !profile) {
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
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Professional Dashboard
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <NotificationsPopover>
            <Button size="icon" variant="ghost" className="relative">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Notifications</span>
            </Button>
          </NotificationsPopover>

          <Link href="/profile">
            <Button size="sm" variant="ghost" className="relative h-9 w-9 rounded-full p-0">
              <img
                src={profile.avatar_url || "/placeholder.svg?height=36&width=36&query=professional profile"}
                alt={profile.full_name || "Profile"}
                className="h-full w-full rounded-full object-cover"
              />
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 ring-1 ring-background" />
              <span className="sr-only">Profile</span>
            </Button>
          </Link>
        </div>
      </header>

      <main className="p-4 md:p-6">
        <div className="grid gap-6">
          <section>
            <Card className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4 items-center md:items-start">
                  <Avatar className="w-20 h-20 border-4 border-background">
                    <AvatarImage
                      src={profile.avatar_url || "/placeholder.svg?height=80&width=80&query=professional profile"}
                      alt={profile.full_name}
                    />
                    <AvatarFallback>
                      {profile.full_name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("") || "PRO"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-center md:text-left">
                    <h2 className="text-2xl font-bold">{profile.full_name}</h2>
                    <p className="text-lg text-muted-foreground">
                      {profile.job_title} at {profile.company_name}
                    </p>
                    <div className="flex gap-2 mt-2 flex-wrap justify-center md:justify-start">
                      <Badge variant="outline" className="bg-blue-50 text-blue-800 dark:bg-blue-900/20">
                        <Briefcase className="h-3 w-3 mr-1" /> {profile.industry}
                      </Badge>
                      <Badge variant="outline" className="bg-green-50 text-green-800 dark:bg-green-900/20">
                        <Users className="h-3 w-3 mr-1" /> {profile.years_experience}+ years
                      </Badge>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button size="sm" variant="outline" className="gap-1">
                      <Calendar className="h-4 w-4" /> Schedule Office Hours
                    </Button>
                    <Button size="sm" className="gap-1 bg-green-600 hover:bg-green-700">
                      <UserPlus className="h-4 w-4" /> Update Profile
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="mentorships">Mentorships</TabsTrigger>
              <TabsTrigger value="students">Student Network</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-600" /> Active Mentorships
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{mentorships.filter((m) => m.status === "Active").length}</div>
                    <p className="text-sm text-muted-foreground">Students you're currently mentoring</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <UserPlus className="h-5 w-5 text-green-600" /> Connection Requests
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">2</div>
                    <p className="text-sm text-muted-foreground">Pending student connection requests</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-purple-600" /> Upcoming Sessions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">1</div>
                    <p className="text-sm text-muted-foreground">Scheduled mentoring sessions</p>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Upcoming Mentorship Sessions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="flex justify-center py-6">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold">Career Advising with Alex Johnson</h3>
                              <p className="text-sm text-muted-foreground">Tomorrow at 3:00 PM • 60 minutes • Online</p>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                Reschedule
                              </Button>
                              <Button size="sm">Join</Button>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 rounded-lg border">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold">Resume Review with Sophia Wang</h3>
                              <p className="text-sm text-muted-foreground">May 25 at 4:30 PM • 45 minutes • Online</p>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                Reschedule
                              </Button>
                              <Button size="sm" variant="outline">
                                Join
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="mentorships">
              <Card>
                <CardHeader>
                  <CardTitle>Your Mentorships</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center py-6">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {mentorships.map((mentorship) => (
                        <div
                          key={mentorship.id}
                          className="flex flex-col md:flex-row gap-4 border-b pb-4 last:border-0"
                        >
                          <Avatar className="w-12 h-12 border-2 border-muted">
                            <AvatarImage
                              src={`/placeholder.svg?height=48&width=48&query=student ${mentorship.studentName}`}
                              alt={mentorship.studentName}
                            />
                            <AvatarFallback>
                              {mentorship.studentName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1">
                            <h3 className="font-medium">{mentorship.studentName}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <GraduationCap className="h-3.5 w-3.5" />
                              <span>
                                {mentorship.university}, {mentorship.major}
                              </span>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-2">
                              <Badge
                                variant={mentorship.status === "Active" ? "default" : "outline"}
                                className={mentorship.status === "Active" ? "bg-green-600" : ""}
                              >
                                {mentorship.status}
                              </Badge>
                              {mentorship.startDate && (
                                <Badge variant="outline">
                                  Started {new Date(mentorship.startDate).toLocaleDateString()}
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-2 self-end md:self-center">
                            <Button size="sm" variant="outline" className="gap-1">
                              <Calendar className="h-4 w-4" /> Schedule
                            </Button>
                            <Button size="sm" className="gap-1">
                              <MessageSquare className="h-4 w-4" /> Message
                            </Button>
                          </div>
                        </div>
                      ))}

                      <Button className="w-full">Find More Students to Mentor</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="students">
              <Card>
                <CardHeader>
                  <CardTitle>Your Student Network</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center py-6">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {studentConnections.map((student) => (
                        <div key={student.id} className="border rounded-lg p-4 flex gap-3">
                          <Avatar className="w-12 h-12">
                            <AvatarImage
                              src={`/placeholder.svg?height=48&width=48&query=student ${student.name}`}
                              alt={student.name}
                            />
                            <AvatarFallback>
                              {student.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1">
                            <h3 className="font-medium">{student.name}</h3>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <GraduationCap className="h-3 w-3" />
                              <span>{student.university}</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Briefcase className="h-3 w-3" />
                              <span>{student.major}</span>
                            </div>
                            <div className="mt-2 flex gap-2">
                              <Button size="sm" variant="outline" className="text-xs h-7 px-2">
                                <MessageSquare className="h-3 w-3 mr-1" /> Message
                              </Button>
                              <Button size="sm" className="text-xs h-7 px-2">
                                <UserPlus className="h-3 w-3 mr-1" /> Mentor
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="content">
              <Card>
                <CardHeader>
                  <CardTitle>Your Content</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <h3 className="text-lg font-medium">Share your professional insights</h3>
                    <p className="text-muted-foreground max-w-md mx-auto my-2">
                      Create articles, videos, or resources to help students learn from your expertise
                    </p>
                    <Button className="mt-4">Create Content</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </SidebarInset>
  )
}
