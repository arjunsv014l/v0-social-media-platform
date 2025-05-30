"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase/client" // Direct import for this page
import type { Profile } from "@/lib/supabase/types"
import { useToast } from "@/components/ui/use-toast"

// Mock data for dropdowns - replace with actual data fetching or keep as is for simplicity
const universities = ["SIMATS", "VIT", "SRM", "Stanford University", "MIT", "Harvard University", "Other"]
const majors = [
  "Computer Science",
  "Business Administration",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Biology",
  "Psychology",
  "Other",
]
const graduationYears = ["2024", "2025", "2026", "2027", "2028", "2029", "2030"]

type StudentProfileFormData = Pick<
  Profile,
  | "full_name"
  | "username"
  | "university"
  | "major"
  | "graduation_year"
  | "student_id_number"
  | "contact_phone"
  | "website"
  | "avatar_url"
>

export default function CompleteStudentProfilePage() {
  const { user, profile, refreshProfile, loading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [formData, setFormData] = useState<Partial<StudentProfileFormData>>({
    full_name: "",
    username: "",
    university: "",
    major: "",
    graduation_year: "",
    student_id_number: "",
    contact_phone: "",
    website: "",
    avatar_url: "",
  })
  const [pageLoading, setPageLoading] = useState(true)
  const [formSubmitting, setFormSubmitting] = useState(false)

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.replace("/login") // Should be handled by AuthContext, but as a safeguard
      } else if (profile) {
        if (profile.is_profile_complete) {
          router.replace("/") // Or student dashboard path
        } else if (profile.user_type !== "student") {
          // This page is only for students, redirect others
          toast({
            title: "Access Denied",
            description: "This profile completion is for students.",
            variant: "destructive",
          })
          router.replace("/") // Or their respective dashboard
        } else {
          // Pre-fill form with existing profile data
          setFormData({
            full_name: profile.full_name || "",
            username: profile.username || "",
            university: profile.university || "",
            major: profile.major || "",
            graduation_year: profile.graduation_year || "",
            student_id_number: profile.student_id_number || "",
            contact_phone: profile.contact_phone || "",
            website: profile.website || "",
            avatar_url: profile.avatar_url || "",
          })
        }
        setPageLoading(false)
      } else {
        // Profile is still loading or null, wait for AuthContext to update
        // setPageLoading(true) // already true
      }
    }
  }, [user, profile, authLoading, router, toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSelectChange = (name: keyof StudentProfileFormData, value: string) => {
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    // Basic client-side validation
    if (
      !formData.full_name ||
      !formData.username ||
      !formData.university ||
      !formData.major ||
      !formData.graduation_year
    ) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields (*).",
        variant: "destructive",
      })
      return
    }

    setFormSubmitting(true)
    try {
      const updates: Partial<Profile> = {
        ...formData,
        is_profile_complete: true,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase.from("profiles").update(updates).eq("id", user.id)

      if (error) {
        console.error("Error updating profile:", error)
        toast({ title: "Error", description: `Failed to update profile: ${error.message}`, variant: "destructive" })
      } else {
        toast({ title: "Profile Updated!", description: "Your student profile is now complete." })
        await refreshProfile() // This will trigger AuthContext to re-evaluate and redirect
        // AuthContext will handle redirection to the student dashboard
      }
    } catch (err: any) {
      console.error("Unexpected error:", err)
      toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" })
    } finally {
      setFormSubmitting(false)
    }
  }

  if (authLoading || pageLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  if (!user || (profile && profile.user_type !== "student")) {
    // This case should ideally be handled by redirection, but as a fallback UI
    return (
      <div className="flex min-h-screen items-center justify-center p-4 text-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p>This page is for student profile completion. You will be redirected.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Complete Your Student Profile
          </CardTitle>
          <CardDescription className="text-center">
            Help us tailor your experience. Fields marked with * are required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  value={formData.full_name || ""}
                  onChange={handleChange}
                  placeholder="e.g., John Doe"
                  required
                  disabled={formSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  name="username"
                  value={formData.username || ""}
                  onChange={handleChange}
                  placeholder="e.g., johndoe99"
                  required
                  disabled={formSubmitting}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="university">University *</Label>
                <Select
                  name="university"
                  value={formData.university || ""}
                  onValueChange={(value) => handleSelectChange("university", value)}
                  disabled={formSubmitting}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your university" />
                  </SelectTrigger>
                  <SelectContent>
                    {universities.map((uni) => (
                      <SelectItem key={uni} value={uni}>
                        {uni}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="major">Major *</Label>
                <Select
                  name="major"
                  value={formData.major || ""}
                  onValueChange={(value) => handleSelectChange("major", value)}
                  disabled={formSubmitting}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your major" />
                  </SelectTrigger>
                  <SelectContent>
                    {majors.map((major) => (
                      <SelectItem key={major} value={major}>
                        {major}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="graduation_year">Graduation Year *</Label>
                <Select
                  name="graduation_year"
                  value={formData.graduation_year || ""}
                  onValueChange={(value) => handleSelectChange("graduation_year", value)}
                  disabled={formSubmitting}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select graduation year" />
                  </SelectTrigger>
                  <SelectContent>
                    {graduationYears.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="student_id_number">Student ID Number</Label>
                <Input
                  id="student_id_number"
                  name="student_id_number"
                  value={formData.student_id_number || ""}
                  onChange={handleChange}
                  placeholder="e.g., S1234567"
                  disabled={formSubmitting}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact_phone">Contact Phone (Optional)</Label>
                <Input
                  id="contact_phone"
                  name="contact_phone"
                  type="tel"
                  value={formData.contact_phone || ""}
                  onChange={handleChange}
                  placeholder="e.g., +1 555-123-4567"
                  disabled={formSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website (Optional)</Label>
                <Input
                  id="website"
                  name="website"
                  type="url"
                  value={formData.website || ""}
                  onChange={handleChange}
                  placeholder="e.g., https://yourportfolio.com"
                  disabled={formSubmitting}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="avatar_url">Avatar URL (Optional)</Label>
              <Input
                id="avatar_url"
                name="avatar_url"
                type="url"
                value={formData.avatar_url || ""}
                onChange={handleChange}
                placeholder="e.g., https://example.com/avatar.png"
                disabled={formSubmitting}
              />
              <p className="text-xs text-muted-foreground">Link to an image for your profile picture.</p>
            </div>

            <Button type="submit" className="w-full" disabled={formSubmitting}>
              {formSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving Profile...
                </>
              ) : (
                "Save and Continue"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <p className="text-xs text-muted-foreground text-center w-full">
            Completing your profile helps personalize your experience and connect with others.
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
