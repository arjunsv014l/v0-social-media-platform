"use client"

import type React from "react"
import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, UploadCloud, UserCircle, XCircle } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import type { Profile } from "@/lib/supabase/types"
import { useToast } from "@/components/ui/use-toast"

// Mock data for dropdowns
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
  | "avatar_url"
>

const AVATAR_BUCKET = "avatars" // Ensure this matches your Supabase storage bucket name

export default function CompleteStudentProfilePage() {
  const { user, profile, refreshProfile, loading: authLoading, authChecked } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState<Partial<StudentProfileFormData>>({
    full_name: "",
    username: "",
    university: "",
    major: "",
    graduation_year: "",
    student_id_number: "",
    contact_phone: "",
    avatar_url: "",
  })
  const [pageLoading, setPageLoading] = useState(true)
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)

  // Local getDashboardPath to avoid context dependency if not needed for this page's core logic
  const getDashboardPath = (userType?: Profile["user_type"]) => {
    switch (userType) {
      case "student":
        return "/"
      case "professional":
        return "/professional/dashboard"
      case "corporate":
        return "/corporate/dashboard"
      case "university":
        return "/university/dashboard"
      default:
        return "/"
    }
  }

  useEffect(() => {
    console.log(
      "[CompleteProfilePage] useEffect. AuthLoading:",
      authLoading,
      "AuthChecked:",
      authChecked,
      "User:",
      !!user,
      "Profile:",
      profile ? { type: profile.user_type, complete: profile.is_profile_complete } : null,
    )

    if (authLoading || !authChecked) {
      console.log("[CompleteProfilePage] Waiting for auth context to initialize...")
      setPageLoading(true) // Keep showing page loader
      return
    }

    // Auth is checked and not loading
    if (!user) {
      console.log("[CompleteProfilePage] No user after auth check, redirecting to /login")
      router.replace("/login")
      return
    }

    // User is logged in
    if (profile) {
      console.log("[CompleteProfilePage] Profile is available.")
      if (profile.is_profile_complete === true) {
        console.log(
          "[CompleteProfilePage] Profile already complete. Redirecting to dashboard:",
          getDashboardPath(profile.user_type),
        )
        router.replace(getDashboardPath(profile.user_type))
        return
      }
      if (profile.user_type !== "student") {
        console.log("[CompleteProfilePage] User is not a student. Redirecting.")
        toast({ title: "Access Denied", description: "Profile completion is for students.", variant: "destructive" })
        router.replace(getDashboardPath(profile.user_type))
        return
      }

      // Student with incomplete profile - good to show the form
      console.log("[CompleteProfilePage] Student with incomplete profile. Setting form data.")
      setFormData({
        full_name: profile.full_name || "",
        username: profile.username || "",
        university: profile.university || "",
        major: profile.major || "",
        graduation_year: profile.graduation_year || "",
        student_id_number: profile.student_id_number || "",
        contact_phone: profile.contact_phone || "",
        avatar_url: profile.avatar_url || "",
      })
      if (profile.avatar_url) setAvatarPreview(profile.avatar_url)
      setPageLoading(false) // Ready to show form
    } else {
      // User is logged in, but profile is still null (after authLoading is false and authChecked is true)
      // This implies profile data is still being fetched or wasn't found.
      // AuthContext's redirection useEffect should handle pushing to /profile/complete if needed.
      // This page should just wait by showing its loader.
      console.log(
        "[CompleteProfilePage] User logged in, but profile is null. Waiting for profile data to load via AuthContext.",
      )
      setPageLoading(true)
    }
  }, [user, profile, authLoading, authChecked, router, toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value })
  const handleSelectChange = (name: keyof StudentProfileFormData, value: string) =>
    setFormData({ ...formData, [name]: value })
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
      if (!allowedTypes.includes(file.type)) {
        toast({ title: "Invalid File Type", variant: "destructive" })
        return
      }
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (file.size > maxSize) {
        toast({ title: "File Too Large", variant: "destructive" })
        return
      }
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => setAvatarPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }
  const handleAvatarUpload = async () => {
    if (!avatarFile || !user) return null
    setIsUploadingAvatar(true)
    const fileExt = avatarFile.name.split(".").pop()
    const fileName = `${user.id}-${Date.now()}.${fileExt}` // More unique filename
    const filePath = `${user.id}/${fileName}`

    try {
      const { error: uploadError } = await supabase.storage.from(AVATAR_BUCKET).upload(filePath, avatarFile, {
        cacheControl: "3600",
        upsert: true, // Allow overwrite if user tries multiple times
      })
      if (uploadError) throw uploadError
      const { data: publicUrlData } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(filePath)
      if (!publicUrlData?.publicUrl) throw new Error("Could not get public URL.")
      toast({ title: "Avatar Uploaded" })
      return publicUrlData.publicUrl
    } catch (error: any) {
      toast({ title: "Avatar Upload Failed", description: error.message, variant: "destructive" })
      return null
    } finally {
      setIsUploadingAvatar(false)
    }
  }
  const removeAvatarPreview = () => {
    setAvatarFile(null)
    setAvatarPreview(formData.avatar_url || null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    if (
      !formData.full_name ||
      !formData.username ||
      !formData.university ||
      !formData.major ||
      !formData.graduation_year
    ) {
      toast({ title: "Missing Required Fields", variant: "destructive" })
      return
    }

    setFormSubmitting(true)
    let uploadedAvatarUrl = formData.avatar_url
    if (avatarFile) {
      const newUrl = await handleAvatarUpload()
      if (newUrl) uploadedAvatarUrl = newUrl
      // else: avatar upload failed, proceed with old/no avatar or handle error more strictly
    }

    try {
      const updates: Partial<Profile> = {
        ...formData,
        avatar_url: uploadedAvatarUrl,
        is_profile_complete: true, // Mark as complete
        updated_at: new Date().toISOString(),
      }
      const { error } = await supabase.from("profiles").update(updates).eq("id", user.id)
      if (error) throw error
      toast({ title: "Profile Updated!" })
      await refreshProfile() // This will trigger AuthContext to re-evaluate and redirect
    } catch (error: any) {
      console.error("Error updating profile:", error)
      toast({ title: "Profile Update Failed", description: error.message, variant: "destructive" })
    } finally {
      setFormSubmitting(false)
    }
  }

  if (pageLoading) {
    // Use page-specific loading state
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-2">Loading profile...</p>
      </div>
    )
  }

  // If pageLoading is false, it means all checks in useEffect passed for showing the form
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
            {/* Avatar Upload Section */}
            <div className="space-y-2">
              <Label htmlFor="avatar">Profile Picture</Label>
              <div className="flex items-center gap-4">
                {avatarPreview ? (
                  <Image
                    src={avatarPreview || "/placeholder.svg?width=80&height=80&query=avatar"}
                    alt="Avatar preview"
                    width={80}
                    height={80}
                    className="rounded-full object-cover aspect-square"
                    onError={() => setAvatarPreview("/placeholder.svg?width=80&height=80&text=Error")}
                  />
                ) : (
                  <UserCircle className="h-20 w-20 text-gray-400" />
                )}
                <div className="flex flex-col gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingAvatar || formSubmitting}
                  >
                    <UploadCloud className="mr-2 h-4 w-4" /> {avatarFile ? "Change Picture" : "Upload Picture"}
                  </Button>
                  {avatarPreview && avatarFile && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={removeAvatarPreview}
                      disabled={isUploadingAvatar || formSubmitting}
                      className="text-xs text-red-500 hover:text-red-600"
                    >
                      <XCircle className="mr-1 h-3 w-3" /> Remove Selected
                    </Button>
                  )}
                </div>
                <Input
                  id="avatar-upload"
                  ref={fileInputRef}
                  name="avatar"
                  type="file"
                  onChange={handleFileChange}
                  accept="image/png, image/jpeg, image/gif, image/webp"
                  className="hidden"
                  disabled={isUploadingAvatar || formSubmitting}
                />
              </div>
              {isUploadingAvatar && (
                <p className="text-xs text-muted-foreground flex items-center">
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" /> Uploading...
                </p>
              )}
            </div>

            {/* Full Name and Username */}
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
                  disabled={formSubmitting || isUploadingAvatar}
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
                  disabled={formSubmitting || isUploadingAvatar}
                />
              </div>
            </div>

            {/* University and Major */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="university">University *</Label>
                <Select
                  name="university"
                  value={formData.university || ""}
                  onValueChange={(value) => handleSelectChange("university", value)}
                  disabled={formSubmitting || isUploadingAvatar}
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
                  disabled={formSubmitting || isUploadingAvatar}
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

            {/* Graduation Year and Student ID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="graduation_year">Graduation Year *</Label>
                <Select
                  name="graduation_year"
                  value={formData.graduation_year || ""}
                  onValueChange={(value) => handleSelectChange("graduation_year", value)}
                  disabled={formSubmitting || isUploadingAvatar}
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
                  disabled={formSubmitting || isUploadingAvatar}
                />
              </div>
            </div>

            {/* Contact Phone */}
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
                  disabled={formSubmitting || isUploadingAvatar}
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={formSubmitting || isUploadingAvatar}>
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
