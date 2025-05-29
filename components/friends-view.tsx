"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { MessageSquareIcon, SearchIcon, UserPlusIcon, UsersIcon, Loader2 } from "lucide-react"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"

interface FriendsViewProps {
  friends: any[]
  requests: any[]
  suggestions: any[]
}

export default function FriendsView({ friends, requests, suggestions }: FriendsViewProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState<string | null>(null)
  const { user } = useAuth()
  const { toast } = useToast()

  const filteredFriends = friends.filter(
    (friend) =>
      friend.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      friend.username.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const sendFriendRequest = async (friendId: string) => {
    if (!user) return

    setLoading(friendId)
    try {
      const { error } = await supabase.from("friendships").insert({
        user_id: user.id,
        friend_id: friendId,
        status: "pending",
      })

      if (error) throw error

      toast({
        title: "Friend request sent! 🎉",
        description: "Your friend request has been sent successfully.",
      })

      // Create notification
      await supabase.from("notifications").insert({
        user_id: friendId,
        type: "friend_request",
        title: "New friend request",
        content: "You have a new friend request",
      })

      // Refresh the page to update the lists
      window.location.reload()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send friend request",
        variant: "destructive",
      })
    } finally {
      setLoading(null)
    }
  }

  const acceptRequest = async (requestId: string, userId: string) => {
    setLoading(requestId)
    try {
      // Update the request status
      const { error } = await supabase.from("friendships").update({ status: "accepted" }).eq("id", requestId)

      if (error) throw error

      // Create reverse friendship
      await supabase.from("friendships").insert({
        user_id: user!.id,
        friend_id: userId,
        status: "accepted",
      })

      toast({
        title: "Friend request accepted! 🤝",
        description: "You are now friends.",
      })

      // Create notification
      await supabase.from("notifications").insert({
        user_id: userId,
        type: "friend_accepted",
        title: "Friend request accepted",
        content: "Your friend request has been accepted",
      })

      // Refresh the page
      window.location.reload()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to accept friend request",
        variant: "destructive",
      })
    } finally {
      setLoading(null)
    }
  }

  const declineRequest = async (requestId: string) => {
    setLoading(requestId)
    try {
      const { error } = await supabase.from("friendships").update({ status: "rejected" }).eq("id", requestId)

      if (error) throw error

      toast({
        title: "Friend request declined",
        description: "The friend request has been declined.",
      })

      // Refresh the page
      window.location.reload()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to decline friend request",
        variant: "destructive",
      })
    } finally {
      setLoading(null)
    }
  }

  return (
    <SidebarInset>
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="md:hidden" />
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Friends 👥
              </h1>
              <p className="text-sm text-muted-foreground hidden md:block">
                Connect with your classmates and build your network
              </p>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-6">
          <Tabs defaultValue="friends" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="friends">Friends ({friends.length})</TabsTrigger>
              <TabsTrigger value="suggestions">Suggestions ({suggestions.length})</TabsTrigger>
              <TabsTrigger value="requests">Requests {requests.length > 0 && `(${requests.length})`}</TabsTrigger>
              <TabsTrigger value="search">Search</TabsTrigger>
            </TabsList>

            <TabsContent value="friends" className="space-y-6">
              <div className="relative mb-6">
                <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search friends..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredFriends.map((friend) => (
                  <Card key={friend.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="relative">
                          <img
                            src={friend.avatar_url || "/placeholder.svg"}
                            alt={friend.full_name}
                            className="h-16 w-16 rounded-full object-cover"
                          />
                          <div className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-green-500 ring-2 ring-background" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{friend.full_name}</h3>
                          <p className="text-sm text-muted-foreground">@{friend.username}</p>
                          <p className="text-xs text-muted-foreground">🟢 Online</p>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Major:</span>
                          <Badge variant="secondary">{friend.major || "Computer Science"}</Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Class of:</span>
                          <span>{friend.graduation_year || "2025"}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Link href="/messages" className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            <MessageSquareIcon className="mr-2 h-4 w-4" />
                            Message
                          </Button>
                        </Link>
                        <Link href={`/profile/${friend.id}`} className="flex-1">
                          <Button size="sm" className="w-full">
                            View Profile
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="suggestions" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {suggestions.map((person) => (
                  <Card key={person.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4 mb-4">
                        <img
                          src={person.avatar_url || "/placeholder.svg"}
                          alt={person.full_name}
                          className="h-16 w-16 rounded-full object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{person.full_name}</h3>
                          <p className="text-sm text-muted-foreground">@{person.username}</p>
                          <Badge variant="outline" className="mt-1 text-xs">
                            {person.major || "Same major"}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Major:</span>
                          <Badge variant="secondary">{person.major || "Computer Science"}</Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Class of:</span>
                          <span>{person.graduation_year || "2025"}</span>
                        </div>
                      </div>

                      <Button
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-600"
                        onClick={() => sendFriendRequest(person.id)}
                        disabled={loading === person.id}
                      >
                        {loading === person.id ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <UserPlusIcon className="mr-2 h-4 w-4" />
                        )}
                        Add Friend
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="requests" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UsersIcon className="h-5 w-5" />
                    Friend Requests
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {requests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <img
                          src={request.user.avatar_url || "/placeholder.svg"}
                          alt={request.user.full_name}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                        <div>
                          <h4 className="font-semibold">{request.user.full_name}</h4>
                          <p className="text-sm text-muted-foreground">@{request.user.username}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => declineRequest(request.id)}
                          disabled={loading === request.id}
                        >
                          Decline
                        </Button>
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-green-500 to-blue-600"
                          onClick={() => acceptRequest(request.id, request.user_id)}
                          disabled={loading === request.id}
                        >
                          {loading === request.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Accept"}
                        </Button>
                      </div>
                    </div>
                  ))}
                  {requests.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">No pending friend requests 📭</div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="search" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Find Students</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="Search by name, username, or major..." className="pl-9" />
                  </div>
                  <div className="text-center py-8 text-muted-foreground">Start typing to search for students 🔍</div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </SidebarInset>
  )
}
