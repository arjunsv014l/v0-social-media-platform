"use client"
import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Building2, GraduationCap, Briefcase } from "lucide-react"
import StudentSignupForm from "@/components/auth/student-signup-form"
import ProfessionalSignupForm from "@/components/auth/professional-signup-form"
import CorporateSignupForm from "@/components/auth/corporate-signup-form"

export default function SignupPage() {
  const [activeTab, setActiveTab] = useState("student")

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/5"></div>
      <Card className="w-full max-w-2xl relative z-10 backdrop-blur-sm bg-background/95">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Join CampusConnect
          </CardTitle>
          <CardDescription className="text-lg">
            Connect students, professionals, and companies in one platform
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="student" className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Student
              </TabsTrigger>
              <TabsTrigger value="professional" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Professional
              </TabsTrigger>
              <TabsTrigger value="corporate" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Corporate
              </TabsTrigger>
            </TabsList>

            <TabsContent value="student">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-blue-600">Student Registration</h3>
                <p className="text-muted-foreground">Connect with peers, find internships, and build your career</p>
              </div>
              <StudentSignupForm />
            </TabsContent>

            <TabsContent value="professional">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-green-600">Professional Registration</h3>
                <p className="text-muted-foreground">Share expertise, mentor students, and expand your network</p>
              </div>
              <ProfessionalSignupForm />
            </TabsContent>

            <TabsContent value="corporate">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-purple-600">Corporate Registration</h3>
                <p className="text-muted-foreground">Find talent, post opportunities, and build your employer brand</p>
              </div>
              <CorporateSignupForm />
            </TabsContent>
          </Tabs>

          <div className="text-center mt-6">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-600 hover:underline font-medium">
                Sign in here
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
