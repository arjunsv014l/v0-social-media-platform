"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EyeIcon, EyeOffIcon, Loader2, GraduationCap, Building2 } from "lucide-react" // Removed Briefcase
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("student") // Default to student
  const { signIn, user, loading: authLoading, authChecked } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    // If user is already logged in and auth check is complete, AuthContext should handle redirection.
    // This effect is more of a safeguard or for specific logic if needed here.
    if (!authLoading && authChecked && user) {
      // console.log("Login page: User already logged in, AuthContext will redirect.");
    }
  }, [user, authLoading, authChecked, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await signIn(email, password)
      toast({
        title: "Welcome back! 🎉",
        description: "You've successfully logged in. Redirecting...",
      })
      // Redirection is primarily handled by AuthContext based on user type
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to sign in. Please check your credentials.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getTabContent = (userType: string, icon: React.ReactNode, title: string, description: string) => (
    <div className="text-center mb-6">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600">
        {icon}
      </div>
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  )

  if (authLoading && !authChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/5 dark:bg-black/20"></div>
      <Card className="w-full max-w-md relative z-10 backdrop-blur-sm bg-background/90 dark:bg-background/80 shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Welcome Back! ✨
          </CardTitle>
          <CardDescription>Sign in to your CampusConnect account as a {activeTab}.</CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              {" "}
              {/* Changed to grid-cols-2 */}
              <TabsTrigger value="student" className="flex items-center gap-1 text-xs">
                <GraduationCap className="h-3 w-3" />
                Student
              </TabsTrigger>
              <TabsTrigger value="corporate" className="flex items-center gap-1 text-xs">
                <Building2 className="h-3 w-3" />
                Corporate
              </TabsTrigger>
            </TabsList>

            <TabsContent value="student">
              {getTabContent(
                "student",
                <GraduationCap className="h-6 w-6 text-white" />,
                "Student Login",
                "Access your campus network",
              )}
            </TabsContent>

            <TabsContent value="corporate">
              {getTabContent(
                "corporate",
                <Building2 className="h-6 w-6 text-white" />,
                "Corporate Login",
                "Find talent and post opportunities",
              )}
            </TabsContent>
          </Tabs>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="bg-background/70 dark:bg-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="bg-background/70 dark:bg-input"
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
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="remember"
                  className="rounded border-gray-300 dark:border-gray-600 text-primary focus:ring-primary"
                  disabled={loading}
                />
                <Label htmlFor="remember" className="text-sm font-normal text-muted-foreground">
                  Remember me
                </Label>
              </div>
              <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In 🚀"
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="text-center mt-4">
          <div className="text-sm w-full text-muted-foreground">
            {"Don't have an account? "}
            <Link href="/signup" className="text-blue-600 hover:underline font-medium">
              Sign up here! 🎓
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
