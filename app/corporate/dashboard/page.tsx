"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import {
  Bell,
  Plus,
  MessageSquare,
  Briefcase,
  Users,
  Building2,
  Loader2,
  GraduationCap,
  BarChart4,
  FileText,
  UserPlus,
} from "lucide-react"
import Link from "next/link"
import { NotificationsPopover } from "@/components/notifications-popover"

export default function CorporateDashboard() {
  const { user, profile, loading } = useAuth()
  const [jobPostings, setJobPostings] = useState([])
  const [internships, setInternships] = useState([])
  const [applications, setApplications] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      setIsLoading(true)

      // For demo purposes, we're generating sample data
      const sampleJobPostings = [
        { id: 1, title: "Software Engineer", applicants: 12, views: 78, status: "Active", deadline: "2023-06-15" },
        { id: 2, title: "Product Manager", applicants: 8, views: 45, status: "Active", deadline: "2023-06-20" },
      ]

      const sampleInternships = [
        {
          id: 1,
          title: "Software Engineering Intern",
          applicants: 24,
          views: 120,
          status: "Active",
          deadline: "2023-05-30",
        },
        { id: 2, title: "Product Management Intern", applicants: 18, views: 92, status: "Draft", deadline: null },
      ]

      const sampleApplications = [
        {
          id: 1,
          name: "Alex Johnson",
          position: "Software Engineer",
          university: "Stanford",
          status: "Reviewed",
          applied: "2023-05-10",
        },
        {
          id: 2,
          name: "Emily Davis",
          position: "Software Engineer",
          university: "MIT",
          status: "New",
          applied: "2023-05-12",
        },
        {
          id: 3,
          name: "Michael Brown",
          position: "Product Manager",
          university: "Harvard",
          status: "Shortlisted",
          applied: "2023-05-08",
        },
      ]

      setJobPostings(sampleJobPostings)
      setInternships(sampleInternships)
      setApplications(sampleApplications)

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
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Corporate Dashboard
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
                src={profile.avatar_url || "/placeholder.svg?height=36&width=36&query=corporate logo"}
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
            <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4 items-center md:items-start">
                  <Avatar className="w-20 h-20 border-4 border-background">
                    <AvatarImage
                      src={profile.avatar_url || "/placeholder.svg?height=80&width=80&query=company logo"}
                      alt={profile.company_name || profile.full_name}
                    />
                    <AvatarFallback>
                      {(profile.company_name || profile.full_name)
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("") || "CO"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-center md:text-left">
                    <h2 className="text-2xl font-bold">{profile.company_name}</h2>
                    <p className="text-lg text-muted-foreground">{profile.industry}</p>
                    <div className="flex gap-2 mt-2 flex-wrap justify-center md:justify-start">
                      <Badge variant="outline" className="bg-purple-50 text-purple-800 dark:bg-purple-900/20">
                        <Building2 className="h-3 w-3 mr-1" /> {profile.company_size || "Enterprise"}
                      </Badge>
                      <Badge variant="outline" className="bg-blue-50 text-blue-800 dark:bg-blue-900/20">
                        <Users className="h-3 w-3 mr-1" /> Corporate Recruiter
                      </Badge>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button size="sm" variant="outline" className="gap-1">
                      <Building2 className="h-4 w-4" /> Update Company
                    </Button>
                    <Button size="sm" className="gap-1 bg-purple-600 hover:bg-purple-700">
                      <Plus className="h-4 w-4" /> Post Job
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="jobs">Job Postings</TabsTrigger>
              <TabsTrigger value="internships">Internships</TabsTrigger>
              <TabsTrigger value="applications">Applications</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-purple-600" /> Active Job Postings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {jobPostings.filter((job) => job.status === "Active").length}
                    </div>
                    <p className="text-sm text-muted-foreground">Current open positions</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-blue-600" /> Active Internships
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {internships.filter((internship) => internship.status === "Active").length}
                    </div>
                    <p className="text-sm text-muted-foreground">Current internship programs</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <UserPlus className="h-5 w-5 text-green-600" /> New Applications
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {applications.filter((app) => app.status === "New").length}
                    </div>
                    <p className="text-sm text-muted-foreground">Applications awaiting review</p>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Applications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="flex justify-center py-6">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {applications.slice(0, 2).map((application) => (
                          <div key={application.id} className="flex gap-3 items-start border-b pb-3 last:border-0">
                            <Avatar>
                              <AvatarImage
                                src={`/placeholder.svg?height=40&width=40&query=student ${application.name}`}
                                alt={application.name}
                              />
                              <AvatarFallback>
                                {application.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>

                            <div className="flex-1">
                              <h3 className="font-medium">{application.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {application.position} • {application.university}
                              </p>
                              <div className="mt-1 flex items-center gap-2">
                                <Badge
                                  variant="outline"
                                  className={
                                    application.status === "New"
                                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200"
                                      : application.status === "Reviewed"
                                        ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200"
                                        : application.status === "Shortlisted"
                                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200"
                                          : ""
                                  }
                                >
                                  {application.status}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  Applied {new Date(application.applied).toLocaleDateString()}
                                </span>
                              </div>
                            </div>

                            <Button size="sm" variant="outline">
                              Review
                            </Button>
                          </div>
                        ))}

                        <Button variant="outline" className="w-full">
                          View All Applications
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recruitment Analytics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex h-[160px] items-center justify-center">
                      <div className="text-center">
                        <BarChart4 className="h-16 w-16 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Analytics dashboard coming soon</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="jobs">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Job Postings</h2>
                <Button className="gap-1">
                  <Plus className="h-4 w-4" /> Post New Job
                </Button>
              </div>

              <Card>
                <CardContent className="p-0">
                  {isLoading ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <div className="divide-y">
                      {jobPostings.map((job) => (
                        <div key={job.id} className="p-4 flex flex-col md:flex-row gap-4 items-start">
                          <div className="flex-1">
                            <h3 className="font-medium text-lg">{job.title}</h3>
                            <div className="flex flex-wrap gap-2 mt-1">
                              <Badge
                                variant={job.status === "Active" ? "default" : "outline"}
                                className={job.status === "Active" ? "bg-green-600" : ""}
                              >
                                {job.status}
                              </Badge>
                              {job.deadline && (
                                <Badge variant="outline">Deadline: {new Date(job.deadline).toLocaleDateString()}</Badge>
                              )}
                            </div>
                            <div className="flex gap-4 mt-2">
                              <div className="text-sm">
                                <span className="text-muted-foreground">Applications:</span>{" "}
                                <span className="font-medium">{job.applicants}</span>
                              </div>
                              <div className="text-sm">
                                <span className="text-muted-foreground">Views:</span>{" "}
                                <span className="font-medium">{job.views}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 self-end md:self-center">
                            <Button size="sm" variant="outline" className="gap-1">
                              <FileText className="h-4 w-4" /> Edit
                            </Button>
                            <Button size="sm" variant="outline" className="gap-1">
                              <Users className="h-4 w-4" /> View Applicants
                            </Button>
                            {job.status === "Active" && <Button size="sm">Promote</Button>}
                          </div>
                        </div>
                      ))}

                      {jobPostings.length === 0 && (
                        <div className="p-8 text-center">
                          <h3 className="font-medium mb-1">No job postings yet</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Create your first job posting to start recruiting talent
                          </p>
                          <Button>
                            <Plus className="h-4 w-4 mr-2" /> Create Job Posting
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="internships">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Internship Programs</h2>
                <Button className="gap-1">
                  <Plus className="h-4 w-4" /> Create New Internship
                </Button>
              </div>

              <Card>
                <CardContent className="p-0">
                  {isLoading ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <div className="divide-y">
                      {internships.map((internship) => (
                        <div key={internship.id} className="p-4 flex flex-col md:flex-row gap-4 items-start">
                          <div className="flex-1">
                            <h3 className="font-medium text-lg">{internship.title}</h3>
                            <div className="flex flex-wrap gap-2 mt-1">
                              <Badge
                                variant={internship.status === "Active" ? "default" : "outline"}
                                className={internship.status === "Active" ? "bg-green-600" : ""}
                              >
                                {internship.status}
                              </Badge>
                              {internship.deadline && (
                                <Badge variant="outline">
                                  Deadline: {new Date(internship.deadline).toLocaleDateString()}
                                </Badge>
                              )}
                            </div>
                            <div className="flex gap-4 mt-2">
                              <div className="text-sm">
                                <span className="text-muted-foreground">Applications:</span>{" "}
                                <span className="font-medium">{internship.applicants}</span>
                              </div>
                              <div className="text-sm">
                                <span className="text-muted-foreground">Views:</span>{" "}
                                <span className="font-medium">{internship.views}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 self-end md:self-center">
                            <Button size="sm" variant="outline" className="gap-1">
                              <FileText className="h-4 w-4" /> Edit
                            </Button>
                            <Button size="sm" variant="outline" className="gap-1">
                              <Users className="h-4 w-4" /> View Applicants
                            </Button>
                            {internship.status === "Active" && <Button size="sm">Promote</Button>}
                            {internship.status === "Draft" && <Button size="sm">Publish</Button>}
                          </div>
                        </div>
                      ))}

                      {internships.length === 0 && (
                        <div className="p-8 text-center">
                          <h3 className="font-medium mb-1">No internship programs yet</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Create your first internship program to connect with students
                          </p>
                          <Button>
                            <Plus className="h-4 w-4 mr-2" /> Create Internship Program
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="applications">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Applications</h2>
                <div className="flex gap-2">
                  <Button variant="outline">Filter</Button>
                  <Button variant="outline">Export</Button>
                </div>
              </div>

              <Card>
                <CardContent className="p-0">
                  {isLoading ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <div className="divide-y">
                      {applications.map((application) => (
                        <div key={application.id} className="p-4 flex flex-col md:flex-row gap-4 items-center">
                          <Avatar className="w-10 h-10">
                            <AvatarImage
                              src={`/placeholder.svg?height=40&width=40&query=student ${application.name}`}
                              alt={application.name}
                            />
                            <AvatarFallback>
                              {application.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1">
                            <h3 className="font-medium">{application.name}</h3>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                              <span>{application.position}</span>
                              <span className="flex items-center gap-1">
                                <GraduationCap className="h-3.5 w-3.5" /> {application.university}
                              </span>
                              <span className="text-muted-foreground">
                                Applied {new Date(application.applied).toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className={
                                application.status === "New"
                                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200"
                                  : application.status === "Reviewed"
                                    ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200"
                                    : application.status === "Shortlisted"
                                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200"
                                      : ""
                              }
                            >
                              {application.status}
                            </Badge>
                          </div>

                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="gap-1">
                              <FileText className="h-4 w-4" /> Resume
                            </Button>
                            <Button size="sm" className="gap-1">
                              <MessageSquare className="h-4 w-4" /> Contact
                            </Button>
                          </div>
                        </div>
                      ))}

                      {applications.length === 0 && (
                        <div className="p-8 text-center">
                          <h3 className="font-medium mb-1">No applications yet</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Applications will appear here once students apply to your job postings
                          </p>
                          <Button>
                            <Plus className="h-4 w-4 mr-2" /> Create Job Posting
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </SidebarInset>
  )
}
