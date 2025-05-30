"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Upload, User } from "lucide-react"

export default function CompleteProfilePage() {
  const { user, profile, refreshProfile } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    bio: "",
    major: "",
    graduationYear: "",
    university: "",
    avatarUrl: "",
  })
  const [loading, setLoading] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  // Initialize form with existing profile data if available
  useEffect(() => {
    if (profile) {
      const nameParts = profile.full_name?.split(" ") || ["", ""]
      setFormData({
        firstName: nameParts[0] || "",
        lastName: nameParts.slice(1).join(" ") || "",
        username: profile.username || "",
        bio: profile.bio || "",
        major: profile.major || "",
        graduationYear: profile.graduation_year?.toString() || "",
        university: profile.university || "",
        avatarUrl: profile.avatar_url || "",
      })
    }
  }, [profile])

  // Redirect if profile is already complete
  useEffect(() => {
    if (profile?.is_profile_complete) {
      router.push("/")
    }
  }, [profile, router])

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user) return

    setUploadingAvatar(true)
    try {
      const fileExt = file.name.split(".").pop()
      const fileName = `${user.id}-${Math.random()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file)

      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath)

      setFormData((prev) => ({ ...prev, avatarUrl: publicUrl }))

      toast({
        title: "Avatar uploaded! 📸",
        description: "Your profile picture has been uploaded successfully.",
      })
    } catch (error: any) {
      console.error("Error uploading avatar:", error)
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload avatar. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    // Validate required fields
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.username ||
      !formData.major ||
      !formData.graduationYear ||
      !formData.university
    ) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields to complete your profile.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const profileUpdate = {
        full_name: `${formData.firstName} ${formData.lastName}`.trim(),
        username: formData.username,
        bio: formData.bio || null,
        major: formData.major,
        graduation_year: Number.parseInt(formData.graduationYear),
        university: formData.university,
        avatar_url: formData.avatarUrl || null,
        is_profile_complete: true, // Mark profile as complete
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase.from("profiles").update(profileUpdate).eq("id", user.id)

      if (error) throw error

      // Refresh the profile in auth context
      await refreshProfile()

      toast({
        title: "Welcome to CampusConnect! 🎉",
        description: "Your profile has been completed successfully. Let's explore the campus!",
      })

      // Redirect to dashboard
      router.push("/")
    } catch (error: any) {
      console.error("Error completing profile:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to complete profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600">
            <User className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Complete Your Profile
          </CardTitle>
          <CardDescription className="text-base">
            Let's set up your profile so you can connect with your campus community
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="h-24 w-24 rounded-full overflow-hidden border-4 border-gray-200 dark:border-gray-700">
                  {formData.avatarUrl ? (
                    <img
                      src={formData.avatarUrl || "/placeholder.svg"}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center">
                      <User className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-blue-500 hover:bg-blue-600 flex items-center justify-center cursor-pointer transition-colors"
                >
                  {uploadingAvatar ? (
                    <Loader2 className="h-4 w-4 text-white animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4 text-white" />
                  )}
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                  disabled={uploadingAvatar || loading}
                />
              </div>
              <p className="text-sm text-muted-foreground">Upload a profile picture</p>
            </div>

            {/* Name Fields */}
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

            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username">Username *</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
                placeholder="johndoe"
                required
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">This will be your unique identifier on the platform</p>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
                placeholder="Tell us a bit about yourself..."
                rows={3}
                disabled={loading}
              />
            </div>

            {/* Academic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Academic Information</h3>

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
                  Completing Profile...
                </>
              ) : (
                "Complete Profile & Enter Dashboard"
              )}
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  )
}
