"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Building2,
  Users,
  Briefcase,
  TrendingUp,
  FileText,
  Calendar,
  Star,
  PlusCircle,
  Eye,
  UserCheck,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

interface DashboardStats {
  activeJobs: number
  applications: number
  hires: number
  candidates: number
}

export default function CorporateDashboard() {
  const { user, profile } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    activeJobs: 0,
    applications: 0,
    hires: 0,
    candidates: 0,
  })

  useEffect(() => {
    // Fetch dashboard stats from job_postings and applications tables
    setStats({
      activeJobs: 8,
      applications: 156,
      hires: 12,
      candidates: 89,
    })
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Corporate Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Welcome back to {profile?.company_name || "Your Company"}! Find the best talent.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button className="bg-gradient-to-r from-purple-500 to-blue-600">
              <PlusCircle className="h-4 w-4 mr-2" />
              Post New Job
            </Button>
            <Button variant="outline">
              <Building2 className="h-4 w-4 mr-2" />
              Company Profile
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Job Posts</CardTitle>
              <Briefcase className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.activeJobs}</div>
              <p className="text-xs text-muted-foreground">+2 this week</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
              <FileText className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.applications}</div>
              <p className="text-xs text-muted-foreground">23 new today</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Successful Hires</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.hires}</div>
              <p className="text-xs text-muted-foreground">This quarter</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Candidate Pool</CardTitle>
              <Users className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.candidates}</div>
              <p className="text-xs text-muted-foreground">Qualified candidates</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="jobs" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="jobs">Job Postings</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="talent">Talent Pool</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="jobs" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Active Job Postings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-purple-600" />
                    Active Job Postings
                  </CardTitle>
                  <CardDescription>Currently open positions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { title: "Senior Software Engineer", applicants: 45, views: 234, type: "Full-time" },
                    { title: "Product Manager", applicants: 28, views: 156, type: "Full-time" },
                    { title: "Data Science Intern", applicants: 67, views: 445, type: "Internship" },
                    { title: "UX Designer", applicants: 23, views: 123, type: "Contract" },
                  ].map((job, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{job.title}</h4>
                          <Badge variant="secondary">{job.type}</Badge>
                        </div>
                        <Button size="sm" variant="ghost">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{job.applicants} applications</span>
                        <span>{job.views} views</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PlusCircle className="h-5 w-5 text-blue-600" />
                    Quick Actions
                  </CardTitle>
                  <CardDescription>Create new opportunities</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    <Button className="h-16 bg-gradient-to-r from-purple-500 to-blue-600">
                      <div className="text-center">
                        <Briefcase className="h-6 w-6 mx-auto mb-2" />
                        <span>Post Full-Time Job</span>
                      </div>
                    </Button>
                    <Button className="h-16 bg-gradient-to-r from-green-500 to-teal-600" variant="outline">
                      <div className="text-center">
                        <Calendar className="h-6 w-6 mx-auto mb-2" />
                        <span>Create Internship Program</span>
                      </div>
                    </Button>
                    <Button className="h-16 bg-gradient-to-r from-orange-500 to-red-600" variant="outline">
                      <div className="text-center">
                        <Star className="h-6 w-6 mx-auto mb-2" />
                        <span>Browse Talent</span>
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="applications" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Applications */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    Recent Applications
                  </CardTitle>
                  <CardDescription>Latest candidate submissions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    {
                      name: "Alice Johnson",
                      position: "Senior Software Engineer",
                      university: "Stanford",
                      status: "New",
                      time: "2 hours ago",
                    },
                    {
                      name: "Bob Chen",
                      position: "Product Manager",
                      university: "MIT",
                      status: "Reviewed",
                      time: "4 hours ago",
                    },
                    {
                      name: "Carol Martinez",
                      position: "Data Science Intern",
                      university: "UC Berkeley",
                      status: "Shortlisted",
                      time: "1 day ago",
                    },
                    {
                      name: "David Kim",
                      position: "UX Designer",
                      university: "Harvard",
                      status: "New",
                      time: "1 day ago",
                    },
                  ].map((app, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {app.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <div>
                          <p className="font-medium">{app.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {app.position} • {app.university}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={
                            app.status === "New" ? "default" : app.status === "Shortlisted" ? "default" : "secondary"
                          }
                        >
                          {app.status}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">{app.time}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Application Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    Application Status
                  </CardTitle>
                  <CardDescription>Overview of all applications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">New Applications</span>
                      <Badge>23</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Under Review</span>
                      <Badge variant="secondary">45</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Shortlisted</span>
                      <Badge variant="secondary">12</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Interviewed</span>
                      <Badge variant="secondary">8</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Hired</span>
                      <Badge variant="secondary">3</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="talent" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-orange-600" />
                  Talent Discovery
                </CardTitle>
                <CardDescription>Find and connect with potential candidates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Talent discovery features coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-indigo-600" />
                  Hiring Analytics
                </CardTitle>
                <CardDescription>Track your recruitment performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Analytics dashboard coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
