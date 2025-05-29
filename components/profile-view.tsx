"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookmarkIcon, CalendarIcon, EditIcon, GraduationCapIcon, MapPinIcon, SettingsIcon } from "lucide-react"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import PostCard from "@/components/post-card"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"

interface ProfileViewProps {
  profile: any
  posts: any[]
  isOwnProfile: boolean
  stats: {
    friends: number
    posts: number
  }
}

export default function ProfileView({ profile, posts, isOwnProfile, stats }: ProfileViewProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isFriend, setIsFriend] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleFriendRequest = async () => {
    if (!user) return

    setLoading(true)
    try {
      const { error } = await supabase.from("friendships").insert({
        user_id: user.id,
        friend_id: profile.id,
        status: "pending",
      })

      if (error) throw error

      toast({
        title: "Friend request sent!",
        description: "Your friend request has been sent successfully.",
      })

      // Create notification
      await supabase.from("notifications").insert({
        user_id: profile.id,
        type: "friend_request",
        title: "New friend request",
        content: `${user.email} sent you a friend request`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send friend request",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
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
          <div className="h-48 w-full bg-gradient-to-r from-blue-500 to-purple-600 md:h-64">
            <img src="/bustling-university-campus.png" alt="Cover" className="h-full w-full object-cover opacity-50" />
          </div>
          <div className="container mx-auto px-4">
            <div className="relative -mt-16 flex flex-col items-center md:-mt-20 md:flex-row md:items-end md:space-x-5">
              <div className="h-32 w-32 overflow-hidden rounded-full border-4 border-background md:h-40 md:w-40">
                <img
                  src={profile?.avatar_url || "/placeholder.svg?height=160&width=160&query=student profile portrait"}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="mt-4 flex flex-1 flex-col items-center space-y-4 md:mt-0 md:items-start md:justify-end md:space-y-0">
                <div className="flex flex-col items-center space-y-1 md:flex-row md:items-end md:space-x-4 md:space-y-0">
                  <h1 className="text-2xl font-bold">{profile?.full_name}</h1>
                  <div className="flex space-x-1 text-sm text-muted-foreground">
                    <span>@{profile?.username}</span>
                  </div>
                </div>
                <div className="mt-2 flex items-center space-x-2 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <GraduationCapIcon className="mr-1 h-4 w-4" />
                    <span>{profile?.major || "Computer Science"}</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center">
                    <CalendarIcon className="mr-1 h-4 w-4" />
                    <span>Class of {profile?.graduation_year || "2025"}</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center">
                    <MapPinIcon className="mr-1 h-4 w-4" />
                    <span>{profile?.university || "Stanford University"}</span>
                  </div>
                </div>
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
              <div className="mt-4 flex space-x-2 md:mt-0">
                {isOwnProfile ? (
                  <>
                    <Button size="sm">
                      <EditIcon className="mr-2 h-4 w-4" />
                      Edit Profile
                    </Button>
                    <Button variant="outline" size="icon">
                      <SettingsIcon className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button size="sm" onClick={handleFriendRequest} disabled={loading || isFriend}>
                      {isFriend ? "Friends" : "Add Friend"}
                    </Button>
                    <Button variant="outline" size="sm">
                      Message
                    </Button>
                  </>
                )}
              </div>
            </div>
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
                  {posts.map((post) => (
                    <PostCard key={post.id} post={post} author={profile} />
                  ))}
                  {posts.length === 0 && <div className="text-center py-8 text-muted-foreground">No posts yet</div>}
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
                          className="aspect-square w-full rounded-md object-cover"
                        />
                      ))}
                  </div>
                  {posts.filter((post) => post.image_url).length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">No media yet</div>
                  )}
                </TabsContent>
                <TabsContent value="academic" className="mt-6">
                  <div className="space-y-4">
                    <div className="rounded-lg border p-4">
                      <h3 className="text-lg font-semibold">Academic Information</h3>
                      <div className="mt-3 space-y-2">
                        <p>
                          <strong>Major:</strong> {profile?.major || "Computer Science"}
                        </p>
                        <p>
                          <strong>University:</strong> {profile?.university || "Stanford University"}
                        </p>
                        <p>
                          <strong>Graduation Year:</strong> {profile?.graduation_year || "2025"}
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="saved" className="mt-6 space-y-4">
                  <div className="text-center py-8 text-muted-foreground">No saved posts yet</div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </SidebarInset>
  )
}
