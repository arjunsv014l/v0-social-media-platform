"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EyeIcon, EyeOffIcon, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context" // Corrected import path
import { useToast } from "@/components/ui/use-toast"

const colleges = ["SIMATS", "VIT", "SRM"]
const yearsOfStudy = ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year (Integrated)"]
const degrees = ["B.Tech CSE", "B.Tech ECE", "B.Tech MECH", "BBA", "MBA", "B.Sc Physics", "M.Sc Chemistry", "Other"]

export default function StudentSignupForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    college: "",
    major: "", // Kept as major, will map to degree or be part of it
    degree: "",
    year_of_study: "",
    studentId: "",
  })
  const { signUp } = useAuth()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.college || !formData.year_of_study || !formData.degree) {
      toast({
        title: "Missing Information",
        description: "Please select your college, year of study, and degree.",
        variant: "destructive",
      })
      return
    }
    setLoading(true)

    const studentData = {
      ...formData,
      userType: "student", // Added for clarity in signUp call
      // Role will be constructed in AuthContext or server-side trigger based on these fields
    }

    try {
      await signUp(formData.email, formData.password, studentData, "student")
      toast({
        title: "Welcome to CampusConnect! 🎓",
        description: "Your student account has been created successfully. Redirecting...",
      })
      // Redirection will be handled by AuthContext
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create account",
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
          <Label htmlFor="firstName-student">First Name *</Label>
          <Input
            id="firstName-student"
            value={formData.firstName}
            onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))}
            placeholder="John"
            required
            disabled={loading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName-student">Last Name *</Label>
          <Input
            id="lastName-student"
            value={formData.lastName}
            onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))}
            placeholder="Doe"
            required
            disabled={loading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email-student">University Email *</Label>
        <Input
          id="email-student"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
          placeholder="john.doe@university.edu"
          required
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="studentId-student">Student ID</Label>
        <Input
          id="studentId-student"
          value={formData.studentId}
          onChange={(e) => setFormData((prev) => ({ ...prev, studentId: e.target.value }))}
          placeholder="STU123456"
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="college-student">College *</Label>
        <Select
          value={formData.college}
          onValueChange={(value) => setFormData((prev) => ({ ...prev, college: value }))}
          disabled={loading}
          required
        >
          <SelectTrigger id="college-student">
            <SelectValue placeholder="Select your college" />
          </SelectTrigger>
          <SelectContent>
            {colleges.map((college) => (
              <SelectItem key={college} value={college}>
                {college}
              </SelectItem>
            ))}
            <SelectItem value="Other">Other (Not listed)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="degree-student">Degree *</Label>
          <Select
            value={formData.degree}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, degree: value }))}
            disabled={loading}
            required
          >
            <SelectTrigger id="degree-student">
              <SelectValue placeholder="Select your degree" />
            </SelectTrigger>
            <SelectContent>
              {degrees.map((degree) => (
                <SelectItem key={degree} value={degree}>
                  {degree}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="year_of_study-student">Year of Study *</Label>
          <Select
            value={formData.year_of_study}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, year_of_study: value }))}
            disabled={loading}
            required
          >
            <SelectTrigger id="year_of_study-student">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              {yearsOfStudy.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password-student">Password *</Label>
        <div className="relative">
          <Input
            id="password-student"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
            placeholder="Create a strong password"
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

      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
        disabled={loading}
        size="lg"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Creating Account...
          </>
        ) : (
          "Create Student Account"
        )}
      </Button>
    </form>
  )
}
