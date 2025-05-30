"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"
import { Briefcase, Users, BookOpen, Calendar, MessageSquare, Award } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export default function ProfessionalDashboard() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [mentorshipRequests, setMentorshipRequests] = useState([
    {
      id: 1,
      name: "Alex Johnson",
      university: "MIT",
      major: "Computer Science",
      message: "I'd love to learn more about your career path in software engineering.",
    },
    {
      id: 2,
      name: "Jamie Smith",
      university: "Stanford",
      major: "Business",
      message: "Looking for guidance on breaking into product management.",
    },
  ])

  useEffect(() => {
    async function loadProfile() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push("/login")
          return
        }

        const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

        if (error) throw error

        if (data.user_type !== "professional") {
          // Redirect non-professionals
          if (data.user_type === "student") {
            router.push("/")
          } else if (data.user_type === "corporate") {
            router.push("/corporate/dashboard")
          }
          return
        }

        setProfile(data)
      } catch (error) {
        console.error("Error loading profile:", error)
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [supabase, router])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Loading...</h2>
          <p className="text-muted-foreground">Please wait while we load your dashboard</p>
        </div>
      </div>
    )
  }

  if (!profile) return null

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Professional Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {profile.full_name}</p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.push("/profile")}>
            View Profile
          </Button>
          <Button>Create Mentorship Opportunity</Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Mentorship Requests</CardTitle>
            <CardDescription>Students seeking your guidance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mentorshipRequests.map((request) => (
                <div key={request.id} className="flex items-start gap-4 rounded-lg border p-3">
                  <Avatar>
                    <AvatarFallback>{request.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{request.name}</p>
                      <Badge variant="outline">New</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {request.university} • {request.major}
                    </p>
                    <p className="text-sm">{request.message}</p>
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="default">
                        Accept
                      </Button>
                      <Button size="sm" variant="outline">
                        Decline
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Your Impact</CardTitle>
            <CardDescription>Your mentorship statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col items-center justify-center rounded-lg border p-3">
                <Users className="h-8 w-8 text-primary" />
                <h3 className="mt-2 text-2xl font-bold">12</h3>
                <p className="text-xs text-muted-foreground">Active Mentees</p>
              </div>
              <div className="flex flex-col items-center justify-center rounded-lg border p-3">
                <MessageSquare className="h-8 w-8 text-primary" />
                <h3 className="mt-2 text-2xl font-bold">48</h3>
                <p className="text-xs text-muted-foreground">Messages</p>
              </div>
              <div className="flex flex-col items-center justify-center rounded-lg border p-3">
                <Calendar className="h-8 w-8 text-primary" />
                <h3 className="mt-2 text-2xl font-bold">8</h3>
                <p className="text-xs text-muted-foreground">Sessions</p>
              </div>
              <div className="flex flex-col items-center justify-center rounded-lg border p-3">
                <Award className="h-8 w-8 text-primary" />
                <h3 className="mt-2 text-2xl font-bold">4.9</h3>
                <p className="text-xs text-muted-foreground">Rating</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Upcoming Sessions</CardTitle>
            <CardDescription>Your scheduled mentorship sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <p className="font-medium">Career Guidance</p>
                  <Badge>Today</Badge>
                </div>
                <p className="text-sm text-muted-foreground">With Taylor Wilson</p>
                <p className="text-sm">3:00 PM - 4:00 PM</p>
              </div>
              <div className="rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <p className="font-medium">Resume Review</p>
                  <Badge variant="outline">Tomorrow</Badge>
                </div>
                <p className="text-sm text-muted-foreground">With Jordan Lee</p>
                <p className="text-sm">11:00 AM - 12:00 PM</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Tabs defaultValue="opportunities">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>
          <div className="mt-6">
            <TabsContent value="opportunities">
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Create Mentorship Opportunity</CardTitle>
                    <CardDescription>Offer your expertise to students in specific areas</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <Button variant="outline" className="h-24 flex-col">
                          <BookOpen className="mb-2 h-6 w-6" />
                          <span>Career Guidance</span>
                        </Button>
                        <Button variant="outline" className="h-24 flex-col">
                          <Briefcase className="mb-2 h-6 w-6" />
                          <span>Resume Review</span>
                        </Button>
                        <Button variant="outline" className="h-24 flex-col">
                          <Users className="mb-2 h-6 w-6" />
                          <span>Mock Interview</span>
                        </Button>
                        <Button variant="outline" className="h-24 flex-col">
                          <Award className="mb-2 h-6 w-6" />
                          <span>Skill Development</span>
                        </Button>
                      </div>
                      <Button className="w-full">Create Custom Opportunity</Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Your Active Opportunities</CardTitle>
                    <CardDescription>Current mentorship opportunities you're offering</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="rounded-lg border p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium">Career Guidance in Tech</h3>
                            <p className="text-sm text-muted-foreground">Helping students navigate tech career paths</p>
                            <div className="mt-2 flex flex-wrap gap-2">
                              <Badge variant="secondary">Career Advice</Badge>
                              <Badge variant="secondary">Technology</Badge>
                            </div>
                          </div>
                          <Badge>5 Applicants</Badge>
                        </div>
                      </div>

                      <div className="rounded-lg border p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium">Resume Review Workshop</h3>
                            <p className="text-sm text-muted-foreground">
                              Monthly resume review sessions for CS students
                            </p>
                            <div className="mt-2 flex flex-wrap gap-2">
                              <Badge variant="secondary">Resume</Badge>
                              <Badge variant="secondary">Workshop</Badge>
                            </div>
                          </div>
                          <Badge>12 Applicants</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="students">
              <Card>
                <CardHeader>
                  <CardTitle>Your Mentees</CardTitle>
                  <CardDescription>Students you're currently mentoring</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarFallback>TW</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">Taylor Wilson</p>
                          <p className="text-sm text-muted-foreground">MIT • Computer Science</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Message
                      </Button>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarFallback>JL</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">Jordan Lee</p>
                          <p className="text-sm text-muted-foreground">Stanford • Business</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Message
                      </Button>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarFallback>RP</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">Riley Parker</p>
                          <p className="text-sm text-muted-foreground">Berkeley • Engineering</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Message
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="resources">
              <Card>
                <CardHeader>
                  <CardTitle>Mentorship Resources</CardTitle>
                  <CardDescription>Tools and guides to help you be an effective mentor</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-lg border p-4">
                      <h3 className="font-medium">Mentorship Best Practices</h3>
                      <p className="text-sm text-muted-foreground">Learn effective techniques for guiding students</p>
                      <Button variant="link" className="px-0">
                        View Guide
                      </Button>
                    </div>

                    <div className="rounded-lg border p-4">
                      <h3 className="font-medium">Career Coaching Templates</h3>
                      <p className="text-sm text-muted-foreground">
                        Ready-to-use templates for career coaching sessions
                      </p>
                      <Button variant="link" className="px-0">
                        Download Templates
                      </Button>
                    </div>

                    <div className="rounded-lg border p-4">
                      <h3 className="font-medium">Resume Review Checklist</h3>
                      <p className="text-sm text-muted-foreground">
                        Comprehensive checklist for reviewing student resumes
                      </p>
                      <Button variant="link" className="px-0">
                        Get Checklist
                      </Button>
                    </div>

                    <div className="rounded-lg border p-4">
                      <h3 className="font-medium">Mock Interview Questions</h3>
                      <p className="text-sm text-muted-foreground">
                        Industry-specific interview questions for practice
                      </p>
                      <Button variant="link" className="px-0">
                        Browse Questions
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
