"use client"

import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import StudentSignupForm from "@/components/auth/student-signup-form"
import ProfessionalSignupForm from "@/components/auth/professional-signup-form" // Assuming this exists or is desired
import CorporateSignupForm from "@/components/auth/corporate-signup-form"
import UniversitySignupForm from "@/components/auth/university-signup-form"
import { GraduationCapIcon, BriefcaseIcon, BuildingIcon, SchoolIcon } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function SignupPage() {
  const { user, loading, authChecked } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && authChecked && user) {
      // If user is already logged in and auth check is complete, redirect from signup
      // AuthContext will handle redirecting to the correct dashboard
    }
  }, [user, loading, authChecked, router])

  if (loading && !authChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="w-full max-w-xl rounded-xl bg-background/80 backdrop-blur-md p-6 md:p-10 shadow-2xl">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 mx-auto">
              <GraduationCapIcon className="h-7 w-7 text-white" />
            </div>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Join CampusConnect
          </h1>
          <p className="text-muted-foreground mt-2">Create an account to connect, learn, and grow.</p>
        </div>

        <Tabs defaultValue="student" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-6">
            <TabsTrigger value="student">
              <GraduationCapIcon className="mr-2 h-4 w-4" /> Student
            </TabsTrigger>
            <TabsTrigger value="university">
              <SchoolIcon className="mr-2 h-4 w-4" /> University
            </TabsTrigger>
            <TabsTrigger value="professional">
              <BriefcaseIcon className="mr-2 h-4 w-4" /> Professional
            </TabsTrigger>
            <TabsTrigger value="corporate">
              <BuildingIcon className="mr-2 h-4 w-4" /> Corporate
            </TabsTrigger>
          </TabsList>
          <TabsContent value="student">
            <StudentSignupForm />
          </TabsContent>
          <TabsContent value="university">
            <UniversitySignupForm />
          </TabsContent>
          <TabsContent value="professional">
            <ProfessionalSignupForm />
          </TabsContent>
          <TabsContent value="corporate">
            <CorporateSignupForm />
          </TabsContent>
        </Tabs>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}
