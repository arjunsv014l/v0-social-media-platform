"use client"

import { useState } from "react"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { StudentSignupForm } from "@/components/auth/student-signup-form"
import { ProfessionalSignupForm } from "@/components/auth/professional-signup-form"
import { CorporateSignupForm } from "@/components/auth/corporate-signup-form"
import { GraduationCap, Briefcase, Building2 } from "lucide-react"

export default function SignupPage() {
  const [activeTab, setActiveTab] = useState("student")

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[500px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
          <p className="text-sm text-muted-foreground">Choose your account type to get started</p>
        </div>

        <Tabs defaultValue="student" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="student" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              <span className="hidden sm:inline">Student</span>
            </TabsTrigger>
            <TabsTrigger value="professional" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              <span className="hidden sm:inline">Professional</span>
            </TabsTrigger>
            <TabsTrigger value="corporate" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">Corporate</span>
            </TabsTrigger>
          </TabsList>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>
                {activeTab === "student" && "Student Registration"}
                {activeTab === "professional" && "Professional Registration"}
                {activeTab === "corporate" && "Corporate Registration"}
              </CardTitle>
              <CardDescription>
                {activeTab === "student" &&
                  "Create an account as a student to connect with peers, find opportunities, and access campus resources."}
                {activeTab === "professional" &&
                  "Join as a professional to mentor students, share industry insights, and build your network."}
                {activeTab === "corporate" &&
                  "Register your company to post job opportunities, find talent, and connect with universities."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TabsContent value="student">
                <StudentSignupForm />
              </TabsContent>
              <TabsContent value="professional">
                <ProfessionalSignupForm />
              </TabsContent>
              <TabsContent value="corporate">
                <CorporateSignupForm />
              </TabsContent>
            </CardContent>
            <CardFooter className="flex justify-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="text-primary underline-offset-4 hover:underline">
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </Card>
        </Tabs>
      </div>
    </div>
  )
}
