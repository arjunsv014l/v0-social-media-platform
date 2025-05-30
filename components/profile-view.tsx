"use client"

import { AvatarFallback } from "@/components/ui/avatar"

import { AvatarImage } from "@/components/ui/avatar"

import { Avatar } from "@/components/ui/avatar"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Loader2,
  Edit3Icon,
  SaveIcon,
  MailIcon,
  BriefcaseIcon,
  BuildingIcon,
  GraduationCapIcon,
  LinkIcon,
  CalendarDaysIcon,
  UserCheck2Icon,
  SchoolIcon,
} from "lucide-react"
import PostCard from "@/components/post-card"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import type { PostWithAuthor, Profile } from "@/lib/supabase/types"

interface ProfileViewProps {
  userId?: string // Optional: if viewing another user's profile
}

export default function ProfileView({ userId }: ProfileViewProps) {
  const { user, profile: initialProfile, refreshProfile } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const [profile, setProfile] = useState<Profile | null>(initialProfile)
  const [isEditing, setIsEditing] = useState(false)
  const [loadingSave, setLoadingSave] = useState(false)
  const [formData, setFormData] = useState<Partial<Profile>>({})
  const [posts, setPosts] = useState<PostWithAuthor[]>([])
  const [stats, setStats] = useState({
    friends: 0,
    posts: 0,
  })
  const [loading, setLoading] = useState(true)
  const [isFriend, setIsFriend] = useState(false)
  const [friendRequestLoading, setFriendRequestLoading] = useState(false)

  // Determine if this is the current user's profile or another user's
  const isOwnProfile = !userId || userId === user?.id
  const targetUserId = userId || user?.id

  useEffect(() => {
    setProfile(initialProfile)
    if (initialProfile) {
      setFormData({
        full_name: initialProfile.full_name || "",
        username: initialProfile.username || "",
        website: initialProfile.website || "",
        bio: initialProfile.bio || "",
        // Student specific (display only, not editable here for simplicity, could be expanded)
        college: initialProfile.college || "",
        degree: initialProfile.degree || "",
        year_of_study: initialProfile.year_of_study || "",
        role: initialProfile.role || "", // Display student role
        // Professional specific
        job_title: initialProfile.job_title || "",
        company: initialProfile.company || "",
        // University specific
        affiliated_college: initialProfile.affiliated_college || "",
        // Corporate specific
        company_name: initialProfile.company_name || "",
      })
    }
  }, [initialProfile])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSaveProfile = async () => {
    if (!user || !profile) return
    setLoadingSave(true)
    try {
      const updates: Partial<Profile> = {
        full_name: formData.full_name,
        username: formData.username,
        website: formData.website,
        bio: formData.bio,
        // Add other editable fields based on user_type if needed
        job_title: formData.job_title, // Example for professional/university
        company: formData.company, // Example for professional
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase.from("profiles").update(updates).eq("id", user.id)
      if (error) throw error

      await refreshProfile() // Refresh context profile
      toast({ title: "Profile Updated", description: "Your changes have been saved." })
      setIsEditing(false)
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to update profile.", variant: "destructive" })
    } finally {
      setLoadingSave(false)
    }
  }

  const handleFriendRequest = async () => {
    if (!user || !targetUserId || isOwnProfile) return

    setFriendRequestLoading(true)
    try {
      const { error } = await supabase.from("friendships").insert({
        user_id: user.id,
        friend_id: targetUserId,
        status: "pending",
      })

      if (error) throw error

      toast({
        title: "Friend request sent! 👋",
        description: "Your friend request has been sent successfully.",
      })

      // Create notification
      await supabase.from("notifications").insert({
        user_id: targetUserId,
        type: "friend_request",
        title: "New friend request",
        content: `${initialProfile?.full_name || user.email} sent you a friend request`,
      })
    } catch (error: any) {
      console.error("Error sending friend request:", error)
      toast({
        title: "Error",
        description: "Failed to send friend request. Please try again.",
        variant: "destructive",
      })
    } finally {
      setFriendRequestLoading(false)
    }
  }

  const handleEditProfile = () => {
    router.push("/settings?tab=profile")
  }

  const fetchProfileData = async () => {
    if (!targetUserId) return

    setLoading(true)
    try {
      // If viewing own profile, use the profile from auth context
      if (isOwnProfile && initialProfile) {
        setProfile(initialProfile)
      } else {
        // Fetch other user's profile
        const { data: profileData, error } = await supabase.from("profiles").select("*").eq("id", targetUserId).single()

        if (error) throw error
        setProfile(profileData)
      }

      // Fetch posts
      const { data: postsData, error: postsError } = await supabase
        .from("posts")
        .select(`
          *,
          author:profiles!posts_user_id_fkey(*)
        `)
        .eq("user_id", targetUserId)
        .order("created_at", { ascending: false })

      if (postsError) throw postsError
      setPosts(postsData as PostWithAuthor[])

      // Fetch stats
      const [friendsResult, postsResult] = await Promise.all([
        supabase
          .from("friendships")
          .select("*", { count: "exact", head: true })
          .eq("user_id", targetUserId)
          .eq("status", "accepted"),
        supabase.from("posts").select("*", { count: "exact", head: true }).eq("user_id", targetUserId),
      ])

      setStats({
        friends: friendsResult.count || 0,
        posts: postsResult.count || 0,
      })

      // Check friendship status if viewing another user's profile
      if (!isOwnProfile && user) {
        const { data: friendship } = await supabase
          .from("friendships")
          .select("*")
          .eq("user_id", user.id)
          .eq("friend_id", targetUserId)
          .eq("status", "accepted")
          .single()

        setIsFriend(!!friendship)
      }
    } catch (error: any) {
      console.error("Error fetching profile data:", error)
      toast({
        title: "Error",
        description: "Failed to load profile data.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfileData()
  }, [targetUserId])

  // Re-fetch profile data when initialProfile changes (for own profile)
  useEffect(() => {
    if (isOwnProfile && initialProfile) {
      setProfile(initialProfile)
    }
  }, [initialProfile, isOwnProfile])

  const renderDetailItem = (IconComponent: React.ElementType, label: string, value?: string | null) => {
    if (!value) return null
    return (
      <div className="flex items-center space-x-3">
        <IconComponent className="h-5 w-5 text-muted-foreground" />
        <span className="text-sm">
          <span className="font-medium text-muted-foreground">{label}: </span>
          {value}
        </span>
      </div>
    )
  }

  if (loading || !profile) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <Card className="overflow-hidden shadow-xl">
        <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 relative">
          {/* Cover image can be added here */}
          <div className="absolute top-4 right-4">
            <Button variant="outline" size="icon" onClick={() => setIsEditing(!isEditing)} disabled={loadingSave}>
              {isEditing ? <SaveIcon className="h-5 w-5" /> : <Edit3Icon className="h-5 w-5" />}
              <span className="sr-only">{isEditing ? "Save Profile" : "Edit Profile"}</span>
            </Button>
          </div>
        </div>
        <CardContent className="p-6 pt-0 relative">
          <div className="flex flex-col items-center -mt-16 mb-6">
            <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
              <AvatarImage src={profile.avatar_url || undefined} alt={profile.full_name || profile.username} />
              <AvatarFallback className="text-4xl">
                {(profile.full_name || profile.username || "U").substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {isEditing ? (
              <Input
                name="full_name"
                value={formData.full_name || ""}
                onChange={handleInputChange}
                className="text-2xl font-bold mt-4 text-center max-w-sm"
                placeholder="Your Full Name"
              />
            ) : (
              <h1 className="text-3xl font-bold mt-4">{profile.full_name || "Anonymous User"}</h1>
            )}
            {isEditing ? (
              <Input
                name="username"
                value={formData.username || ""}
                onChange={handleInputChange}
                className="text-muted-foreground text-center max-w-xs"
                placeholder="your_username"
              />
            ) : (
              <p className="text-muted-foreground">@{profile.username || "username"}</p>
            )}
          </div>

          {/* Display Role for Students */}
          {profile.user_type === "student" && profile.role && !isEditing && (
            <div className="text-center mb-4 p-2 bg-secondary rounded-md">
              <span className="font-semibold text-primary flex items-center justify-center">
                <UserCheck2Icon className="h-5 w-5 mr-2" /> {profile.role}
              </span>
            </div>
          )}

          {/* Display Affiliated College for University Users */}
          {profile.user_type === "university" && profile.affiliated_college && !isEditing && (
            <div className="text-center mb-4 p-2 bg-secondary rounded-md">
              <span className="font-semibold text-primary flex items-center justify-center">
                <SchoolIcon className="h-5 w-5 mr-2" /> Affiliated with: {profile.affiliated_college}
              </span>
            </div>
          )}

          {/* Display Company Name for Corporate Users */}
          {profile.user_type === "corporate" && profile.company_name && !isEditing && (
            <div className="text-center mb-4 p-2 bg-secondary rounded-md">
              <span className="font-semibold text-primary flex items-center justify-center">
                <BuildingIcon className="h-5 w-5 mr-2" /> Representing: {profile.company_name}
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">About</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {isEditing ? (
                  <Textarea
                    name="bio"
                    value={formData.bio || ""}
                    onChange={handleInputChange}
                    placeholder="Tell us about yourself..."
                    className="min-h-[100px]"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground min-h-[60px]">{profile.bio || "No bio yet."}</p>
                )}
                {renderDetailItem(MailIcon, "Email", user?.email)}
                {isEditing ? (
                  <div className="space-y-1">
                    <Label htmlFor="website" className="text-xs">
                      Website
                    </Label>
                    <Input
                      name="website"
                      id="website"
                      value={formData.website || ""}
                      onChange={handleInputChange}
                      placeholder="https://your.link"
                    />
                  </div>
                ) : (
                  renderDetailItem(LinkIcon, "Website", profile.website)
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {profile.user_type === "student" && (
                  <>
                    {renderDetailItem(GraduationCapIcon, "College", profile.college)}
                    {renderDetailItem(CalendarDaysIcon, "Year", profile.year_of_study)}
                    {renderDetailItem(BriefcaseIcon, "Degree", profile.degree)}
                  </>
                )}
                {profile.user_type === "professional" && (
                  <>
                    {isEditing ? (
                      <>
                        <div className="space-y-1">
                          <Label htmlFor="job_title" className="text-xs">
                            Job Title
                          </Label>
                          <Input
                            name="job_title"
                            id="job_title"
                            value={formData.job_title || ""}
                            onChange={handleInputChange}
                            placeholder="Software Engineer"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="company" className="text-xs">
                            Company
                          </Label>
                          <Input
                            name="company"
                            id="company"
                            value={formData.company || ""}
                            onChange={handleInputChange}
                            placeholder="Tech Corp"
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        {renderDetailItem(BriefcaseIcon, "Job Title", profile.job_title)}
                        {renderDetailItem(BuildingIcon, "Company", profile.company)}
                      </>
                    )}
                  </>
                )}
                {profile.user_type === "university" &&
                  (isEditing ? (
                    <div className="space-y-1">
                      <Label htmlFor="job_title" className="text-xs">
                        Your Title/Dept.
                      </Label>
                      <Input
                        name="job_title"
                        id="job_title"
                        value={formData.job_title || ""}
                        onChange={handleInputChange}
                        placeholder="Professor of CS"
                      />
                    </div>
                  ) : (
                    renderDetailItem(BriefcaseIcon, "Title/Dept.", profile.job_title)
                  ))}
                {profile.user_type === "corporate" &&
                  (isEditing ? (
                    <div className="space-y-1">
                      <Label htmlFor="job_title" className="text-xs">
                        Your Title
                      </Label>
                      <Input
                        name="job_title"
                        id="job_title"
                        value={formData.job_title || ""}
                        onChange={handleInputChange}
                        placeholder="HR Manager"
                      />
                    </div>
                  ) : (
                    renderDetailItem(BriefcaseIcon, "Your Title", profile.job_title)
                  ))}
                {/* Add more details based on user type */}
              </CardContent>
            </Card>
          </div>

          {isEditing && (
            <div className="flex justify-end">
              <Button onClick={handleSaveProfile} disabled={loadingSave}>
                {loadingSave && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {!isOwnProfile && (
        <div className="mt-8">
          <Button size="sm" onClick={handleFriendRequest} disabled={friendRequestLoading || isFriend}>
            {isFriend ? "Friends" : "Add Friend"}
          </Button>
          <Button variant="outline" size="sm">
            Message
          </Button>
        </div>
      )}

      {isOwnProfile && (
        <div className="mt-8">
          <Button size="sm" onClick={handleEditProfile}>
            <Edit3Icon className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
          <Button variant="outline" size="icon" onClick={() => router.push("/settings")}>
            <BuildingIcon className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Posts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {posts.length > 0 ? (
              posts.map((post) => <PostCard key={post.id} post={post} author={profile} />)
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {isOwnProfile ? "You haven't posted anything yet" : "No posts yet"}
                </p>
                {isOwnProfile && (
                  <Button className="mt-4" onClick={() => router.push("/")}>
                    Create Your First Post
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
