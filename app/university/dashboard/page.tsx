"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, MessageSquare, Briefcase, TrendingUp, BookOpen, Award, Clock, PlusCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"

interface DashboardStats {
  mentees: number
  messages: number
  posts: number
  connections: number
}

export default function ProfessionalDashboard() {
  const { user, profile } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    mentees: 0,
    messages: 0,
    posts: 0,
    connections: 0,
  })
  const [recentActivity, setRecentActivity] = useState([])

  useEffect(() => {
    // Fetch dashboard stats and recent activity
    // This would connect to your mentorship and networking tables
    setStats({
      mentees: 12,
      messages: 8,
      posts: 24,
      connections: 156,
    })
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Professional Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Welcome back, {profile?.full_name}! Shape the next generation of talent.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button className="bg-gradient-to-r from-green-500 to-blue-600">
              <PlusCircle className="h-4 w-4 mr-2" />
              New Mentorship
            </Button>
            <Link href="/messages">
              <Button variant="outline">
                <MessageSquare className="h-4 w-4 mr-2" />
                Messages
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Mentees</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.mentees}</div>
              <p className="text-xs text-muted-foreground">+2 this month</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
              <MessageSquare className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.messages}</div>
              <p className="text-xs text-muted-foreground">3 urgent</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Posts Shared</CardTitle>
              <Briefcase className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.posts}</div>
              <p className="text-xs text-muted-foreground">+5 this week</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Network Size</CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.connections}</div>
              <p className="text-xs text-muted-foreground">Growing steadily</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="mentorship" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="mentorship">Mentorship</TabsTrigger>
            <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
            <TabsTrigger value="network">Network</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="mentorship" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Active Mentorships */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-green-600" />
                    Active Mentorships
                  </CardTitle>
                  <CardDescription>Students you're currently mentoring</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { name: "Sarah Chen", major: "Computer Science", university: "Stanford", duration: "3 months" },
                    { name: "Michael Rodriguez", major: "Business", university: "MIT", duration: "1 month" },
                    { name: "Emily Johnson", major: "Engineering", university: "UC Berkeley", duration: "6 months" },
                  ].map((mentee, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {mentee.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <div>
                          <p className="font-medium">{mentee.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {mentee.major} • {mentee.university}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary">{mentee.duration}</Badge>
                        <Button size="sm" variant="ghost" className="ml-2">
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Mentorship Requests */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-orange-600" />
                    Pending Requests
                  </CardTitle>
                  <CardDescription>Students seeking mentorship</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    {
                      name: "Alex Kim",
                      major: "Data Science",
                      university: "Harvard",
                      message: "Looking for guidance in ML career path...",
                    },
                    {
                      name: "Jessica Wang",
                      major: "Product Management",
                      university: "Stanford",
                      message: "Interested in tech product strategy...",
                    },
                  ].map((request, index) => (
                    <div key={index} className="p-3 border rounded-lg space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {request.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <div>
                          <p className="font-medium">{request.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {request.major} • {request.university}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground italic">"{request.message}"</p>
                      <div className="flex gap-2">
                        <Button size="sm" className="bg-green-600">
                          Accept
                        </Button>
                        <Button size="sm" variant="outline">
                          Decline
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="opportunities" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-blue-600" />
                  Share Opportunities
                </CardTitle>
                <CardDescription>Help students discover career opportunities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button className="h-20 bg-gradient-to-r from-blue-500 to-purple-600">
                    <div className="text-center">
                      <PlusCircle className="h-6 w-6 mx-auto mb-2" />
                      <span>Post Job Opening</span>
                    </div>
                  </Button>
                  <Button className="h-20 bg-gradient-to-r from-green-500 to-teal-600" variant="outline">
                    <div className="text-center">
                      <Award className="h-6 w-6 mx-auto mb-2" />
                      <span>Share Internship</span>
                    </div>
                  </Button>
                </div>

                {/* Recent opportunities shared */}
                <div className="space-y-3 mt-6">
                  <h4 className="font-medium">Recently Shared</h4>
                  {[
                    { title: "Software Engineering Intern", company: "Tech Corp", applicants: 24 },
                    { title: "Product Manager Role", company: "Startup Inc", applicants: 12 },
                  ].map((opp, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{opp.title}</p>
                        <p className="text-sm text-muted-foreground">{opp.company}</p>
                      </div>
                      <Badge>{opp.applicants} applicants</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="network" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  Professional Network
                </CardTitle>
                <CardDescription>Connect with other professionals and industry leaders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Network features coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-indigo-600" />
                  Industry Insights
                </CardTitle>
                <CardDescription>Share your expertise and industry knowledge</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Insights dashboard coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
