"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/auth-context"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/supabase/types"
import { User, Briefcase, Building2 } from "lucide-react" // Added Building2 for University

type UserRole = "student" | "corporate" | "university"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState<UserRole>("student")
  const router = useRouter()
  const { user, profile, loading: authLoading } = useAuth() // Get user and profile from context

  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    if (!authLoading && user && profile) {
      // User is logged in and profile is loaded, redirect based on profile
      switch (profile.user_type) {
        case "student":
          router.push("/") // Student main feed
          break
        case "professional":
          // Professionals are removed, but handle if somehow exists
          router.push("/professional/dashboard")
          break
        case "corporate":
          router.push("/corporate/dashboard")
          break
        case "university":
          router.push("/university/dashboard")
          break
        default:
          router.push("/") // Fallback
      }
    }
  }, [user, profile, authLoading, router])

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        setError(signInError.message)
        setLoading(false)
        return
      }
      // The useEffect above will handle redirection once user & profile are updated in context
      // Forcing a reload or specific fetch might be needed if context doesn't update immediately
      // For now, relying on AuthContext to update and trigger useEffect
      // router.refresh(); // Could help, but AuthContext should ideally handle it
    } catch (catchError: any) {
      setError(catchError.message || "An unexpected error occurred.")
    } finally {
      setLoading(false)
    }
  }

  const getTabContent = (role: UserRole) => {
    switch (role) {
      case "student":
        return { title: "Student Login", description: "Access your student dashboard and resources." }
      case "corporate":
        return { title: "Corporate Login", description: "Access your corporate portal and tools." }
      case "university":
        return { title: "University Login", description: "Access the university management portal." }
      default:
        return { title: "Login", description: "Sign in to your account." }
    }
  }

  const { title, description } = getTabContent(selectedRole)

  if (authLoading || (user && profile)) {
    // Show a loading state or null while redirecting
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 to-slate-700 p-4">
        <p className="text-white text-xl">Loading your experience...</p>
      </div>
    )
  }

  return (
    <div className="w-full lg:grid lg:min-h-[100vh] lg:grid-cols-2 xl:min-h-[100vh]">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[400px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">{title}</h1>
            <p className="text-balance text-muted-foreground">{description}</p>
          </div>
          <Tabs value={selectedRole} onValueChange={(value) => setSelectedRole(value as UserRole)} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="student" className="flex items-center gap-2">
                <User className="h-4 w-4" /> Student
              </TabsTrigger>
              <TabsTrigger value="university" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" /> University
              </TabsTrigger>
              <TabsTrigger value="corporate" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" /> Corporate
              </TabsTrigger>
            </TabsList>
            {/* TabsContent is not strictly needed here if the form is generic, 
                but can be used if form fields differ per role in the future.
                For now, the selectedRole state and getTabContent handle text changes.
            */}
            <TabsContent value={selectedRole} className="mt-0 pt-0">
              {" "}
              {/* Ensure no extra padding */}
              {/* Content is effectively handled by the main form below, updated by selectedRole */}
            </TabsContent>
          </Tabs>

          <form onSubmit={handleSignIn} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password" // Assuming you have a forgot password page
                  className="ml-auto inline-block text-sm underline"
                >
                  Forgot your password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing In..." : "Sign In"}
            </Button>
            {/* Optional: Social logins if you have them
            <Button variant="outline" className="w-full">
              Login with Google
            </Button> */}
          </form>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="underline">
              Sign up
            </Link>
          </div>
        </div>
      </div>
      <div className="hidden bg-muted lg:block">
        <Image
          src="/university-social-network.png"
          alt="Social Platform"
          width="1920"
          height="1080"
          className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  )
}
