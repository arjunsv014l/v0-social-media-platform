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

export default function StudentSignupForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    university: "",
    major: "",
    graduationYear: "",
    studentId: "",
  })
  const { signUp } = useAuth()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await signUp(formData.email, formData.password, {
        ...formData,
        userType: "student",
      })
      toast({
        title: "Welcome to CampusConnect! 🎓",
        description: "Your student account has been created successfully.",
      })
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
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))}
            placeholder="John"
            required
            disabled={loading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))}
            placeholder="Doe"
            required
            disabled={loading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">University Email *</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
          placeholder="john.doe@university.edu"
          required
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="studentId">Student ID</Label>
        <Input
          id="studentId"
          value={formData.studentId}
          onChange={(e) => setFormData((prev) => ({ ...prev, studentId: e.target.value }))}
          placeholder="STU123456"
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="university">University *</Label>
        <Select
          value={formData.university}
          onValueChange={(value) => setFormData((prev) => ({ ...prev, university: value }))}
          disabled={loading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select your university" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Stanford University">Stanford University</SelectItem>
            <SelectItem value="MIT">MIT</SelectItem>
            <SelectItem value="Harvard University">Harvard University</SelectItem>
            <SelectItem value="UC Berkeley">UC Berkeley</SelectItem>
            <SelectItem value="UCLA">UCLA</SelectItem>
            <SelectItem value="University of Washington">University of Washington</SelectItem>
            <SelectItem value="University of Michigan">University of Michigan</SelectItem>
            <SelectItem value="New York University">New York University</SelectItem>
            <SelectItem value="Columbia University">Columbia University</SelectItem>
            <SelectItem value="University of Texas at Austin">University of Texas at Austin</SelectItem>
            <SelectItem value="University of Illinois">University of Illinois</SelectItem>
            <SelectItem value="Georgia Tech">Georgia Tech</SelectItem>
            <SelectItem value="University of Pennsylvania">University of Pennsylvania</SelectItem>
            <SelectItem value="Princeton University">Princeton University</SelectItem>
            <SelectItem value="Yale University">Yale University</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="major">Major *</Label>
          <Select
            value={formData.major}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, major: value }))}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select your major" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Computer Science">Computer Science</SelectItem>
              <SelectItem value="Business Administration">Business Administration</SelectItem>
              <SelectItem value="Engineering">Engineering</SelectItem>
              <SelectItem value="Psychology">Psychology</SelectItem>
              <SelectItem value="Biology">Biology</SelectItem>
              <SelectItem value="Mathematics">Mathematics</SelectItem>
              <SelectItem value="English">English</SelectItem>
              <SelectItem value="History">History</SelectItem>
              <SelectItem value="Art">Art</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="graduationYear">Graduation Year *</Label>
          <Select
            value={formData.graduationYear}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, graduationYear: value }))}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2026">2026</SelectItem>
              <SelectItem value="2027">2027</SelectItem>
              <SelectItem value="2028">2028</SelectItem>
              <SelectItem value="2029">2029</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password *</Label>
        <div className="relative">
          <Input
            id="password"
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
