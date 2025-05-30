"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookmarkIcon, CalendarIcon, EditIcon, GraduationCapIcon, MapPinIcon, SettingsIcon } from "lucide-react"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import PostCard from "@/components/post-card"
import { useAuth } from "@/context/AuthContext"
import { supabase } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import type { PostWithAuthor } from "@/lib/supabase/types"

interface ProfileViewProps {
  userId?: string // Optional: if viewing another user's profile
}

export default function ProfileView({ userId }: ProfileViewProps) {
  const { user, profile: currentUserProfile } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const [profileData, setProfileData] = useState<any>(null)
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
    const fetchProfileData = async () => {
      if (!targetUserId) return

      setLoading(true)
      try {
        // If viewing own profile, use the profile from auth context
        if (isOwnProfile && currentUserProfile) {
          setProfileData(currentUserProfile)
        } else {
          // Fetch other user's profile
          const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", targetUserId).single()

          if (error) throw error
          setProfileData(profile)
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

    fetchProfileData()
  }, [targetUserId, isOwnProfile, currentUserProfile, user, toast])

  // Re-fetch profile data when currentUserProfile changes (for own profile)
  useEffect(() => {
    if (isOwnProfile && currentUserProfile) {
      setProfileData(currentUserProfile)
    }
  }, [currentUserProfile, isOwnProfile])

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
        content: `${currentUserProfile?.full_name || user.email} sent you a friend request`,
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

  if (loading) {
    return (
      <SidebarInset>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </SidebarInset>
    )
  }

  if (!profileData) {
    return (
      <SidebarInset>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground">Profile not found</p>
          </div>
        </div>
      </SidebarInset>
    )
  }

  return (
    <SidebarInset>
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="md:hidden" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Profile 👤
            </h1>
          </div>
        </header>

        <div className="relative">
          {/* Cover Photo */}
          <div className="h-48 w-full bg-gradient-to-r from-blue-500 to-purple-600 md:h-64">
            <img src="/bustling-university-campus.png" alt="Cover" className="h-full w-full object-cover opacity-50" />
          </div>

          <div className="container mx-auto px-4">
            <div className="relative -mt-16 flex flex-col items-center md:-mt-20 md:flex-row md:items-end md:space-x-5">
              {/* Profile Picture */}
              <div className="h-32 w-32 overflow-hidden rounded-full border-4 border-background md:h-40 md:w-40">
                <img
                  src={profileData.avatar_url || "/placeholder.svg?height=160&width=160&query=student profile portrait"}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Profile Info */}
              <div className="mt-4 flex flex-1 flex-col items-center space-y-4 md:mt-0 md:items-start md:justify-end md:space-y-0">
                <div className="flex flex-col items-center space-y-1 md:flex-row md:items-end md:space-x-4 md:space-y-0">
                  <h1 className="text-2xl font-bold">{profileData.full_name}</h1>
                  <div className="flex space-x-1 text-sm text-muted-foreground">
                    <span>@{profileData.username}</span>
                  </div>
                </div>

                {/* Academic Info */}
                <div className="mt-2 flex flex-wrap items-center justify-center md:justify-start gap-2 text-sm text-muted-foreground">
                  {profileData.major && (
                    <div className="flex items-center">
                      <GraduationCapIcon className="mr-1 h-4 w-4" />
                      <span>{profileData.major}</span>
                    </div>
                  )}
                  {profileData.graduation_year && (
                    <>
                      <span>•</span>
                      <div className="flex items-center">
                        <CalendarIcon className="mr-1 h-4 w-4" />
                        <span>Class of {profileData.graduation_year}</span>
                      </div>
                    </>
                  )}
                  {profileData.university && (
                    <>
                      <span>•</span>
                      <div className="flex items-center">
                        <MapPinIcon className="mr-1 h-4 w-4" />
                        <span>{profileData.university}</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Bio */}
                {profileData.bio && (
                  <p className="mt-2 text-center md:text-left text-sm text-muted-foreground max-w-md">
                    {profileData.bio}
                  </p>
                )}

                {/* Stats */}
                <div className="mt-2 flex gap-4 text-sm">
                  <div className="text-center">
                    <p className="font-semibold">{stats.posts}</p>
                    <p className="text-muted-foreground">Posts</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold">{stats.friends}</p>
                    <p className="text-muted-foreground">Friends</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 flex space-x-2 md:mt-0">
                {isOwnProfile ? (
                  <>
                    <Button size="sm" onClick={handleEditProfile}>
                      <EditIcon className="mr-2 h-4 w-4" />
                      Edit Profile
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => router.push("/settings")}>
                      <SettingsIcon className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button size="sm" onClick={handleFriendRequest} disabled={friendRequestLoading || isFriend}>
                      {isFriend ? "Friends" : "Add Friend"}
                    </Button>
                    <Button variant="outline" size="sm">
                      Message
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Tabs */}
            <div className="mt-8">
              <Tabs defaultValue="posts" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="posts">Posts</TabsTrigger>
                  <TabsTrigger value="media">Media</TabsTrigger>
                  <TabsTrigger value="academic">Academic</TabsTrigger>
                  <TabsTrigger value="saved">
                    <BookmarkIcon className="mr-2 h-4 w-4" />
                    Saved
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="posts" className="mt-6 space-y-4">
                  {posts.length > 0 ? (
                    posts.map((post) => <PostCard key={post.id} post={post} author={profileData} />)
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
                </TabsContent>

                <TabsContent value="media" className="mt-6">
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                    {posts
                      .filter((post) => post.image_url)
                      .map((post) => (
                        <img
                          key={post.id}
                          src={post.image_url || "/placeholder.svg"}
                          alt="Media"
                          className="aspect-square w-full rounded-md object-cover cursor-pointer hover:opacity-80 transition-opacity"
                        />
                      ))}
                  </div>
                  {posts.filter((post) => post.image_url).length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">No media posts yet</div>
                  )}
                </TabsContent>

                <TabsContent value="academic" className="mt-6">
                  <div className="space-y-4">
                    <div className="rounded-lg border p-6">
                      <h3 className="text-lg font-semibold mb-4">Academic Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {profileData.major && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Major</p>
                            <p className="text-base">{profileData.major}</p>
                          </div>
                        )}
                        {profileData.university && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">University</p>
                            <p className="text-base">{profileData.university}</p>
                          </div>
                        )}
                        {profileData.graduation_year && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Graduation Year</p>
                            <p className="text-base">{profileData.graduation_year}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Member Since</p>
                          <p className="text-base">
                            {new Date(profileData.created_at).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="saved" className="mt-6 space-y-4">
                  <div className="text-center py-12 text-muted-foreground">
                    {isOwnProfile ? "You haven't saved any posts yet" : "Saved posts are private"}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </SidebarInset>
  )
}
