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

const affiliatedColleges = ["SIMATS", "VIT", "SRM"]

export default function UniversitySignupForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    jobTitle: "", // e.g., Dean, Administrator, HOD
    affiliatedCollege: "",
  })
  const { signUp } = useAuth()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.affiliatedCollege) {
      toast({
        title: "Missing Information",
        description: "Please select the affiliated college.",
        variant: "destructive",
      })
      return
    }
    setLoading(true)

    const universityData = {
      ...formData,
      userType: "university",
      role: `University Admin - ${formData.affiliatedCollege}`, // Example role for university user
    }

    try {
      await signUp(formData.email, formData.password, universityData, "university")
      toast({
        title: "Welcome to CampusConnect! 🏫",
        description: "Your university account has been created successfully. Redirecting...",
      })
      // Redirection will be handled by AuthContext
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create university account",
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
          <Label htmlFor="firstName-uni">First Name *</Label>
          <Input
            id="firstName-uni"
            value={formData.firstName}
            onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))}
            placeholder="Admin"
            required
            disabled={loading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName-uni">Last Name *</Label>
          <Input
            id="lastName-uni"
            value={formData.lastName}
            onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))}
            placeholder="User"
            required
            disabled={loading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email-uni">Official Email *</Label>
        <Input
          id="email-uni"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
          placeholder="admin@university.edu"
          required
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="jobTitle-uni">Job Title / Role *</Label>
        <Input
          id="jobTitle-uni"
          value={formData.jobTitle}
          onChange={(e) => setFormData((prev) => ({ ...prev, jobTitle: e.target.value }))}
          placeholder="e.g., Dean, HOD, Administrator"
          required
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="affiliatedCollege-uni">Affiliated College *</Label>
        <Select
          value={formData.affiliatedCollege}
          onValueChange={(value) => setFormData((prev) => ({ ...prev, affiliatedCollege: value }))}
          disabled={loading}
          required
        >
          <SelectTrigger id="affiliatedCollege-uni">
            <SelectValue placeholder="Select affiliated college" />
          </SelectTrigger>
          <SelectContent>
            {affiliatedColleges.map((college) => (
              <SelectItem key={college} value={college}>
                {college}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password-uni">Password *</Label>
        <div className="relative">
          <Input
            id="password-uni"
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
        className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700"
        disabled={loading}
        size="lg"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Creating Account...
          </>
        ) : (
          "Create University Account"
        )}
      </Button>
    </form>
  )
}
