"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase/client"
import type { Profile, Course } from "@/lib/supabase/types"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, UsersIcon, BookOpenIcon, ShieldAlertIcon } from "lucide-react"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar" // Assuming SidebarInset is used for layout

export default function UniversityDashboardPage() {
  const { user, profile, loading: authLoading, authChecked } = useAuth()
  const [students, setStudents] = useState<Profile[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authChecked || authLoading) return
    if (!user || !profile || profile.user_type !== "university" || !profile.affiliated_college) {
      setLoadingData(false)
      return
    }

    const fetchData = async () => {
      setLoadingData(true)
      setError(null)
      try {
        const college = profile.affiliated_college

        // Fetch students
        const { data: studentData, error: studentError } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_type", "student")
          .eq("college", college)

        if (studentError) throw studentError
        setStudents(studentData || [])

        // Fetch courses
        const { data: courseData, error: courseError } = await supabase
          .from("courses")
          .select("*")
          .eq("college_name", college) // Using college_name as per schema

        if (courseError) throw courseError
        setCourses(courseData || [])
      } catch (err: any) {
        console.error("Error fetching university dashboard data:", err)
        setError(err.message || "Failed to load data.")
      } finally {
        setLoadingData(false)
      }
    }

    fetchData()
  }, [user, profile, authLoading, authChecked])

  if (authLoading || !authChecked) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  if (!user || !profile) {
    // This case should ideally be handled by AuthContext redirecting to /login
    return (
      <div className="flex flex-col h-screen items-center justify-center text-center p-4">
        <ShieldAlertIcon className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-2xl font-semibold mb-2">Access Denied</h1>
        <p className="text-muted-foreground">You must be logged in to view this page.</p>
      </div>
    )
  }

  if (profile.user_type !== "university") {
    return (
      <div className="flex flex-col h-screen items-center justify-center text-center p-4">
        <ShieldAlertIcon className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-2xl font-semibold mb-2">Access Denied</h1>
        <p className="text-muted-foreground">This dashboard is for university personnel only.</p>
      </div>
    )
  }

  if (!profile.affiliated_college) {
    return (
      <div className="flex flex-col h-screen items-center justify-center text-center p-4">
        <ShieldAlertIcon className="h-16 w-16 text-yellow-500 mb-4" />
        <h1 className="text-2xl font-semibold mb-2">Configuration Error</h1>
        <p className="text-muted-foreground">
          Your university profile is not affiliated with a college. Please contact support.
        </p>
      </div>
    )
  }

  return (
    <SidebarInset>
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="md:hidden" />
          <h1 className="text-xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
            {profile.affiliated_college} University Dashboard
          </h1>
        </div>
        {/* Add any header actions for university users if needed */}
      </header>
      <main className="flex-1 p-4 md:p-6 space-y-6">
        {loadingData && (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        {error && (
          <Card className="bg-destructive/10 border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{error}</p>
            </CardContent>
          </Card>
        )}
        {!loadingData && !error && (
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium">Students</CardTitle>
                <UsersIcon className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {students.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[80px]">Avatar</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Role / Details</TableHead>
                        <TableHead>Email</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell>
                            <Avatar className="h-10 w-10">
                              <AvatarImage
                                src={student.avatar_url || undefined}
                                alt={student.full_name || student.username}
                              />
                              <AvatarFallback>
                                {(student.full_name || student.username || "U").substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          </TableCell>
                          <TableCell className="font-medium">{student.full_name || student.username}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {student.role || `${student.degree} - ${student.year_of_study}`}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {/* Email is sensitive, consider if needed. For now, user.email is not in profile type directly from select '*' */}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-sm text-muted-foreground">No students found for {profile.affiliated_college}.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium">Courses</CardTitle>
                <BookOpenIcon className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {courses.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Professor</TableHead>
                        <TableHead>Credits</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {courses.map((course) => (
                        <TableRow key={course.id}>
                          <TableCell className="font-medium">{course.code}</TableCell>
                          <TableCell>{course.name}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{course.professor || "N/A"}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{course.credits || "N/A"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-sm text-muted-foreground">No courses found for {profile.affiliated_college}.</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </SidebarInset>
  )
}
