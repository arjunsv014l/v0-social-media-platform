"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EyeIcon, EyeOffIcon, Loader2, GraduationCap, Briefcase, Building2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/components/ui/use-toast"
import type { Profile } from "@/types"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("student")
  const { signIn } = useAuth()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const userTypeForLogin = activeTab as Profile["user_type"]
      await signIn(email, password, userTypeForLogin)
      toast({
        title: "Welcome back! 🎉",
        description: "You've successfully logged in.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to sign in",
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/5"></div>
      <Card className="w-full max-w-md relative z-10 backdrop-blur-sm bg-background/95">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Welcome Back! ✨
          </CardTitle>
          <CardDescription>Sign in to your CampusConnect account</CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="student" className="flex items-center gap-1 text-xs">
                <GraduationCap className="h-3 w-3" />
                Student
              </TabsTrigger>
              <TabsTrigger value="university" className="flex items-center gap-1 text-xs">
                <Briefcase className="h-3 w-3" />
                University
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

            <TabsContent value="university">
              {getTabContent(
                "university",
                <Briefcase className="h-6 w-6 text-white" />,
                "University Login",
                "Access university administration tools",
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
                <input type="checkbox" id="remember" className="rounded" disabled={loading} />
                <Label htmlFor="remember" className="text-sm">
                  Remember me
                </Label>
              </div>
              <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
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

        <CardFooter className="text-center">
          <div className="text-sm w-full">
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
