"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EyeIcon, EyeOffIcon, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/components/ui/use-toast"
import type { Profile } from "@/lib/supabase/types"

const COLLEGES = ["SIMATS", "VIT", "SRM"] as const
const YEARS_OF_STUDY = ["1st", "2nd", "3rd", "4th", "5th"] as const

export default function StudentSignupForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [fullName, setFullName] = useState("")
  const [collegeName, setCollegeName] = useState<Profile["college_name"]>()
  const [yearOfStudy, setYearOfStudy] = useState<Profile["year_of_study"]>()
  const [degree, setDegree] = useState("")
  const [studentIdNumber, setStudentIdNumber] = useState("")

  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match.", variant: "destructive" })
      return
    }
    if (!collegeName || !yearOfStudy || !degree || !fullName) {
      toast({ title: "Error", description: "Please fill all required fields.", variant: "destructive" })
      return
    }

    setLoading(true)
    try {
      await signUp({
        email,
        password,
        user_type: "student",
        full_name: fullName,
        college_name: collegeName,
        year_of_study: yearOfStudy,
        degree,
        student_id_number: studentIdNumber || undefined, // Optional
      })
      toast({
        title: "Account Created! 🎉",
        description: "Welcome to CampusConnect! You will be redirected shortly.",
      })
      // Redirection will be handled by AuthContext
    } catch (error: any) {
      toast({
        title: "Sign Up Error",
        description: error.message || "Failed to create account. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fullName-student">Full Name</Label>
          <Input
            id="fullName-student"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email-student">Email</Label>
          <Input
            id="email-student"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="password-student">Password</Label>
          <div className="relative">
            <Input
              id="password-student"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
            >
              {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword-student">Confirm Password</Label>
          <div className="relative">
            <Input
              id="confirmPassword-student"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={loading}
            >
              {showConfirmPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="collegeName-student">College</Label>
          <Select
            value={collegeName}
            onValueChange={(value) => setCollegeName(value as Profile["college_name"])}
            disabled={loading}
          >
            <SelectTrigger id="collegeName-student">
              <SelectValue placeholder="Select College" />
            </SelectTrigger>
            <SelectContent>
              {COLLEGES.map((college) => (
                <SelectItem key={college} value={college}>
                  {college}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="yearOfStudy-student">Year of Study</Label>
          <Select
            value={yearOfStudy}
            onValueChange={(value) => setYearOfStudy(value as Profile["year_of_study"])}
            disabled={loading}
          >
            <SelectTrigger id="yearOfStudy-student">
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent>
              {YEARS_OF_STUDY.map((year) => (
                <SelectItem key={year} value={year}>
                  {year} Year
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="degree-student">Degree (e.g., B.Tech CSE)</Label>
          <Input
            id="degree-student"
            value={degree}
            onChange={(e) => setDegree(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="studentIdNumber-student">Student ID (Optional)</Label>
          <Input
            id="studentIdNumber-student"
            value={studentIdNumber}
            onChange={(e) => setStudentIdNumber(e.target.value)}
            disabled={loading}
          />
        </div>
      </div>

      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing Up...
          </>
        ) : (
          "Sign Up as Student"
        )}
      </Button>
    </form>
  )
}
