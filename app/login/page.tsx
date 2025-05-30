"use client"

import type React from "react"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EyeIcon, EyeOffIcon, Loader2, GraduationCapIcon, BriefcaseIcon, BuildingIcon, SchoolIcon } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation" // For potential redirection if needed outside AuthContext
import { useEffect } from "react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("student") // Default to student

  const { signIn, user, loading: authLoading, authChecked } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && authChecked && user) {
      // If user is already logged in and auth check is complete, redirect from login
      // AuthContext will handle redirecting to the correct dashboard
    }
  }, [user, authLoading, authChecked, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await signIn(email, password)
      toast({
        title: "Login Successful!",
        description: "Welcome back! Redirecting to your dashboard...",
      })
      // Redirection is handled by AuthContext based on user type
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid email or password.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (authLoading && !authChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="w-full max-w-md rounded-xl bg-background/80 backdrop-blur-md p-6 md:p-10 shadow-2xl">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 mx-auto">
              <GraduationCapIcon className="h-7 w-7 text-white" />
            </div>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Welcome Back!
          </h1>
          <p className="text-muted-foreground mt-2">Log in as a {activeTab} to continue.</p>
        </div>

        <Tabs defaultValue="student" className="w-full" onValueChange={setActiveTab}>
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
          {/* Content for tabs can be a single form as login is unified */}
          <TabsContent value="student">
            {" "}
            {/* Fallthrough */}
            <TabsContent value="university">
              {" "}
              {/* Fallthrough */}
              <TabsContent value="professional">
                {" "}
                {/* Fallthrough */}
                <TabsContent value="corporate">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="email-login">Email</Label>
                      <Input
                        id="email-login"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading}
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password-login">Password</Label>
                        <Link
                          href="/forgot-password" // Placeholder for forgot password page
                          className="text-sm font-medium text-primary hover:underline"
                        >
                          Forgot password?
                        </Link>
                      </div>
                      <div className="relative">
                        <Input
                          id="password-login"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          disabled={loading}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={loading}
                        >
                          {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={loading} size="lg">
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Logging In...
                        </>
                      ) : (
                        `Log In as ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </TabsContent>
            </TabsContent>
          </TabsContent>
        </Tabs>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-medium text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
