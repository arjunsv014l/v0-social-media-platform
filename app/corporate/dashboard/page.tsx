"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SidebarInset } from "@/components/ui/sidebar"
import { CorporateHeader } from "@/components/corporate/corporate-header"
import { CorporateSidebar } from "@/components/corporate/corporate-sidebar"
import { Briefcase, Loader2, FileText, GraduationCap, LineChart } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import type { JobPosting, InternshipProgram } from "@/lib/supabase/types"

export default function CorporateDashboard() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([])
  const [internships, setInternships] = useState<InternshipProgram[]>([])
  const [applicationsCount, setApplicationsCount] = useState(0)
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
      return
    }

    if (profile && profile.user_type !== "corporate") {
      // Redirect to appropriate dashboard based on user type
      router.push(profile.user_type === "professional" ? "/professional/dashboard" : "/")
      return
    }

    const fetchDashboardData = async () => {
      if (!user) return

      try {
        setLoadingData(true)

        // Fetch job postings
        const { data: jobs } = await supabase
          .from("job_postings")
          .select("*")
          .eq("posted_by", user.id)
          .order("created_at", { ascending: false })

        setJobPostings((jobs as JobPosting[]) || [])

        // Fetch internships
        const { data: internshipData } = await supabase
          .from("internship_programs")
          .select("*")
          .eq("posted_by", user.id)
          .order("created_at", { ascending: false })

        setInternships((internshipData as InternshipProgram[]) || [])

        // Fetch applications count
        const { count } = await supabase
          .from("applications")
          .select("*", { count: "exact", head: true })
          .or(
            `job_posting_id.in.(${jobs?.map((j) => j.id).join(",")}),internship_id.in.(${internshipData?.map((i) => i.id).join(",")})`,
          )

        setApplicationsCount(count || 0)
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
      <CorporateSidebar />
      <SidebarInset>
        <CorporateHeader />

        <main className="flex-1 p-6">
          <div className="mx-auto max-w-6xl space-y-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Corporate Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome back, {profile?.company_name || profile?.full_name}. Here's an overview of your recruitment
                activities.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Job Postings</CardTitle>
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{jobPostings.length}</div>
                  <p className="text-xs text-muted-foreground">Active job opportunities</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Internship Programs</CardTitle>
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{internships.length}</div>
                  <p className="text-xs text-muted-foreground">Active internship opportunities</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Applications</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{applicationsCount}</div>
                  <p className="text-xs text-muted-foreground">Total applications received</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Profile Views</CardTitle>
                  <LineChart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{Math.floor(Math.random() * 100) + 50}</div>
                  <p className="text-xs text-muted-foreground">+{Math.floor(Math.random() * 20)}% from last week</p>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="jobs">
              <TabsList className="grid w-full grid-cols-3 md:w-auto">
                <TabsTrigger value="jobs">Job Postings</TabsTrigger>
                <TabsTrigger value="internships">Internships</TabsTrigger>
                <TabsTrigger value="applications">Applications</TabsTrigger>
              </TabsList>

              <TabsContent value="jobs" className="space-y-4 mt-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Your Job Postings</h2>
                  <Button>
                    <Briefcase className="mr-2 h-4 w-4" />
                    Post New Job
                  </Button>
                </div>

                {jobPostings.length > 0 ? (
                  <div className="grid gap-4">
                    {jobPostings.map((job) => (
                      <Card key={job.id}>
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle>{job.title}</CardTitle>
                              <CardDescription>
                                {job.location || "Remote"} • {job.job_type || "Full-time"}
                              </CardDescription>
                            </div>
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="line-clamp-2 text-sm text-muted-foreground">{job.description}</p>
                          <div className="mt-4 flex flex-wrap gap-2">
                            {job.skills_required?.slice(0, 3).map((skill, i) => (
                              <span
                                key={i}
                                className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold"
                              >
                                {skill}
                              </span>
                            ))}
                            {job.skills_required && job.skills_required.length > 3 && (
                              <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                                +{job.skills_required.length - 3} more
                              </span>
                            )}
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                          <div className="text-sm text-muted-foreground">
                            Posted on {new Date(job.created_at).toLocaleDateString()}
                          </div>
                          <div className="text-sm font-medium">{Math.floor(Math.random() * 20)} applicants</div>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="p-8 text-center">
                    <CardContent className="pt-4 pb-6">
                      <Briefcase className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                      <h3 className="mt-4 text-lg font-medium">No job postings yet</h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        You haven't posted any jobs yet. Create your first job posting to start recruiting talent.
                      </p>
                    </CardContent>
                    <CardFooter className="flex justify-center">
                      <Button>
                        <Briefcase className="mr-2 h-4 w-4" />
                        Create Job Posting
                      </Button>
                    </CardFooter>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="internships" className="space-y-4 mt-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Your Internship Programs</h2>
                  <Button>
                    <GraduationCap className="mr-2 h-4 w-4" />
                    Post New Internship
                  </Button>
                </div>

                {internships.length > 0 ? (
                  <div className="grid gap-4">
                    {internships.map((internship) => (
                      <Card key={internship.id}>
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle>{internship.title}</CardTitle>
                              <CardDescription>
                                {internship.location || "Remote"} • {internship.duration || "3 months"}
                              </CardDescription>
                            </div>
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="line-clamp-2 text-sm text-muted-foreground">{internship.description}</p>
                          <div className="mt-4 flex flex-wrap gap-2">
                            {internship.skills_required?.slice(0, 3).map((skill, i) => (
                              <span
                                key={i}
                                className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold"
                              >
                                {skill}
                              </span>
                            ))}
                            {internship.skills_required && internship.skills_required.length > 3 && (
                              <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                                +{internship.skills_required.length - 3} more
                              </span>
                            )}
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                          <div className="text-sm text-muted-foreground">
                            Posted on {new Date(internship.created_at).toLocaleDateString()}
                          </div>
                          <div className="text-sm font-medium">{Math.floor(Math.random() * 15)} applicants</div>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="p-8 text-center">
                    <CardContent className="pt-4 pb-6">
                      <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                      <h3 className="mt-4 text-lg font-medium">No internship programs yet</h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        You haven't posted any internship programs yet. Create your first internship to start recruiting
                        students.
                      </p>
                    </CardContent>
                    <CardFooter className="flex justify-center">
                      <Button>
                        <GraduationCap className="mr-2 h-4 w-4" />
                        Create Internship Program
                      </Button>
                    </CardFooter>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="applications" className="space-y-4 mt-6">
                <h2 className="text-xl font-semibold">Recent Applications</h2>
                <Card className="p-8 text-center">
                  <CardContent className="pt-4 pb-6">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                    <h3 className="mt-4 text-lg font-medium">No applications yet</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      You haven't received any applications yet. Applications will appear here once candidates apply.
                    </p>
                  </CardContent>
                  <CardFooter className="flex justify-center">
                    <Button>View All Postings</Button>
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
