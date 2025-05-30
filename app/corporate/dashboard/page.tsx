"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"
import { Users, Briefcase, GraduationCap, UserPlus } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"

export default function CorporateDashboard() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [profile, setProfile] = useState<any>(null)
  const [company, setCompany] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [applications, setApplications] = useState([
    { id: 1, name: "Alex Johnson", university: "MIT", major: "Computer Science", position: "Software Engineer Intern", status: "pending" },
    { id: 2, name: "Jamie Smith", university: "Stanford", major: "Business", position: "Marketing Intern", status: "reviewed" },
    { id: 3, name: "Taylor Wilson", university: "Berkeley", major: "Data Science", position: "Data Analyst", status: "shortlisted" }
  ])
  
  useEffect(() => {
    async function loadProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          router.push('/login')
          return
        }
        
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
          
        if (error) throw error
        
        if (data.user_type !== 'corporate') {
          // Redirect non-corporate users
          if (data.user_type === 'student') {
            router.push('/')
          } else if (data.user_type === 'professional') {
            router.push('/professional/dashboard')
          }
          return
        }
        
        setProfile(data)
        
        // Load company data
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .select('*')
          .eq('name', data.company_name)
          .single()
          
        if (!companyError) {
          setCompany(companyData)
        }
      } catch (error) {
        console.error('Error loading profile:', error)
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
          <h1 className="text-3xl font-bold">Corporate Dashboard</h1>
          <p className="text-muted-foreground">
            {profile.company_name} • {profile.job_title}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.push('/profile')}>
            Company Profile
          </Button>
          <Button>Post New Job</Button>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Job Postings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Briefcase className="mr-2 h-4 w-4 text-muted-foreground" />
              <div className="text-2xl font-bold">8</div>
            </div>
            <p className="text-xs text-muted-foreground">+2 from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Users className="mr-2 h-4 w-4 text-muted-foreground" />
              <div className="text-2xl font-bold">42</div>
            </div>
            <p className="text-xs text-muted-foreground">+15 new this week</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Internship Programs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <GraduationCap className="mr-2 h-4 w-4 text-muted-foreground" />
              <div className="text-2xl font-bold">3</div>
            </div>
            <p className="text-xs text-muted-foreground">Summer, Fall, Spring</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Talent Pool</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <UserPlus className="mr-2 h-4 w-4 text-muted-foreground" />
              <div className="text-2xl font-bold">156</div>
            </div>
            <p className="text-xs text-muted-foreground">Across 24 universities</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Applications</CardTitle>
            <CardDescription>
              Review and manage candidate applications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {applications.map(application => (
                <div key={application.id} className="flex items-start gap-4 rounded-lg border p-4">
                  <Avatar>
                    <AvatarFallback>{application.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{application.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {application.university} • {application.major}
                        </p>
                      </div>
                      <Badge variant={
                        application.status === "pending" ? "outline" : 
                        application.status === "reviewed" ? "secondary" : 
                        "default"
                      }>
                        {application.status === "pending" ? "Pending" : 
                         application.status === "reviewed" ? "Reviewed" : 
                         "Shortlisted"}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm">Applied for: {application.position}</p>
                    <div className="mt-3 flex gap-2">
                      <Button size="sm">View Profile</Button>
                      <Button size="sm" variant="outline">Review</Button>
                    </div>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full">View All Applications</Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recruitment Progress</CardTitle>
            <CardDescription>
              Current hiring pipeline status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <div>Software Engineer</div>
                  <div className="text-muted-foreground">8/10</div>
                </div>
                <Progress value={80} className="h-2" />
              </div>
              
              <div>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <div>Product Manager</div>
                  <div className="text-muted-foreground">3/5</div>
                </div>
                <Progress value={60} className="h-2" />
              </div>
              
              <div>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <div>Marketing Intern</div>
                  <div className="text-muted-foreground">2/4</div>
                </div>
                <Progress value={50} className="h-2" />
              </div>
              
              <div>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <div>Data Analyst</div>
                  <div className="text-muted-foreground">5/6</div>
                </div>
                <Progress value={83} className="h-2" />
              </div>
              
              <Separator />
              
              <div className="rounded-lg bg-muted p-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">Overall Progress</div>
                  <div className="text-sm font-medium">72%</div>
                </div>
                <Progress value={72} className="mt-2 h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-8">
        <Tabs defaultValue="jobs">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="jobs">Job Postings</TabsTrigger>
            <TabsTrigger value="internships">Internship Programs</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          <div className="mt-6">
            <TabsContent value="jobs">
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Active Job Postings</CardTitle>
                    <CardDescription>
                      Currently open positions at your company
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="rounded-lg border p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium">Senior Software Engineer</h3>
                            <p className="text-sm text-muted-foreground">
                              Full-time • Remote • Posted 2 weeks ago
                            </p>
                            <div className="mt-2 flex flex-wrap gap-2">
                              <Badge variant="secondary">React</Badge>
                              <Badge variant="secondary">Node.js</Badge>
                              <Badge variant="secondary">AWS</Badge>
                            </div>
                          </div>
                          <Badge>12 Applicants</Badge>
                        </div>
                        <div className="mt-4 flex gap-2">
                          <Button size="sm" variant="outline">Edit</Button>
                          <Button size="sm" variant="outline">View Applicants</Button>
                        </div>
                      </div>
                      
                      <div className="rounded-lg border p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium">Product Manager</h3>
                            <p className="text-sm text-muted-foreground">
                              Full-time • Hybrid • Posted 1 week ago
                            </p>
                            <div className="mt-2 flex flex-wrap gap-2">
                              <Badge variant="secondary">Product</Badge>
                              <Badge variant="secondary">Agile</Badge>
                              <Badge variant="secondary">B2B</Badge>
                            </div>
                          </div>
                          <Badge>8 Applicants</Badge>
                        </div>
                        <div className="mt-4 flex gap-2">
                          <Button size="sm" variant="outline">Edit</Button>
                          <Button size="sm" variant="outline">View Applicants</Button>
                        </div>
                      </div>
                      
                      <Button className="w-full">Post New Job</Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Job Posting Templates</CardTitle>
                    <CardDescription>
                      Quick-start templates for common positions
                    </CardDescription>\
