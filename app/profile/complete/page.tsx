"use client"

import type React from "react"
import { useEffect, useState, useRef } from "react"
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

const AVATAR_BUCKET = "avatars"

export default function CompleteStudentProfilePage() {
  const { user, profile, refreshProfile, loading } = useAuth()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mountedRef = useRef(true)

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

  const [pageState, setPageState] = useState<"loading" | "ready" | "error">("loading")
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)

  // Initialize page state
  useEffect(() => {
    if (loading) {
      setPageState("loading")
      return
    }

    if (!user) {
      setPageState("error")
      setErrorMessage("Please log in to continue")
      return
    }

    if (!profile) {
      setPageState("loading")
      return
    }

    if (profile.user_type !== "student") {
      setPageState("error")
      setErrorMessage("This page is only for student users")
      return
    }

    if (profile.is_profile_complete === true) {
      setPageState("error")
      setErrorMessage("Profile is already complete")
      return
    }

    // Initialize form data
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

    if (profile.avatar_url) {
      setAvatarPreview(profile.avatar_url)
    }

    setPageState("ready")
  }, [user, profile, loading])

  useEffect(() => {
    return () => {
      mountedRef.current = false
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSelectChange = (name: keyof StudentProfileFormData, value: string) => {
    setFormData({ ...formData, [name]: value })
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please select a JPG, PNG, GIF or WEBP image.",
          variant: "destructive",
        })
        return
      }

      const maxSize = 5 * 1024 * 1024 // 5MB
      if (file.size > maxSize) {
        toast({
          title: "File Too Large",
          description: "Image size should not exceed 5MB.",
          variant: "destructive",
        })
        return
      }

      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        if (mountedRef.current) {
          setAvatarPreview(reader.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAvatarUpload = async () => {
    if (!avatarFile || !user) return null

    setIsUploadingAvatar(true)
    const fileExt = avatarFile.name.split(".").pop()
    const fileName = `${user.id}-${Date.now()}.${fileExt}`
    const filePath = `${user.id}/${fileName}`

    try {
      const { error: uploadError } = await supabase.storage.from(AVATAR_BUCKET).upload(filePath, avatarFile, {
        cacheControl: "3600",
        upsert: true,
      })

      if (uploadError) throw uploadError

      const { data: publicUrlData } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(filePath)

      if (!publicUrlData?.publicUrl) {
        throw new Error("Could not get public URL for avatar.")
      }

      toast({ title: "Avatar Uploaded", description: "Your new avatar is ready." })
      return publicUrlData.publicUrl
    } catch (error: any) {
      console.error("Error uploading avatar:", error)
      toast({
        title: "Avatar Upload Failed",
        description: error.message || "Could not upload image.",
        variant: "destructive",
      })
      return null
    } finally {
      if (mountedRef.current) {
        setIsUploadingAvatar(false)
      }
    }
  }

  const removeAvatarPreview = () => {
    setAvatarFile(null)
    setAvatarPreview(formData.avatar_url || null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
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
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields (*).",
        variant: "destructive",
      })
      return
    }

    setFormSubmitting(true)
    let uploadedAvatarUrl = formData.avatar_url

    try {
      // Upload avatar if there's a new file
      if (avatarFile) {
        const newUrl = await handleAvatarUpload()
        if (newUrl) {
          uploadedAvatarUrl = newUrl
        }
      }

      // Update profile
      const updates: Partial<Profile> = {
        ...formData,
        avatar_url: uploadedAvatarUrl,
        is_profile_complete: true,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase.from("profiles").update(updates).eq("id", user.id)

      if (error) {
        console.error("Error updating profile:", error)
        toast({
          title: "Error",
          description: `Failed to update profile: ${error.message}`,
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Profile Updated!",
        description: "Your student profile is now complete.",
      })

      // Refresh profile data
      await refreshProfile()
    } catch (err: any) {
      console.error("Unexpected error:", err)
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      if (mountedRef.current) {
        setFormSubmitting(false)
      }
    }
  }

  // Loading state
  if (pageState === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (pageState === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Access Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">{errorMessage}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Form state
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
                    src={avatarPreview || "/placeholder.svg"}
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
                    <UploadCloud className="mr-2 h-4 w-4" />
                    {avatarFile ? "Change Picture" : "Upload Picture"}
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
                      <XCircle className="mr-1 h-3 w-3" />
                      Remove Selected
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
