"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { MessageSquareIcon, SearchIcon, UserPlusIcon, UsersIcon } from "lucide-react"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import Link from "next/link"

const friends = [
  {
    id: 1,
    name: "Emma Johnson",
    username: "@emma_j",
    avatar: "/placeholder.svg?height=60&width=60&query=student profile 1",
    major: "Computer Science",
    year: "2025",
    mutualFriends: 12,
    isOnline: true,
    lastActive: "Active now",
  },
  {
    id: 2,
    name: "Alex Chen",
    username: "@alexc",
    avatar: "/placeholder.svg?height=60&width=60&query=student profile 2",
    major: "Engineering",
    year: "2024",
    mutualFriends: 8,
    isOnline: false,
    lastActive: "2 hours ago",
  },
  {
    id: 3,
    name: "Sarah Williams",
    username: "@sarahw",
    avatar: "/placeholder.svg?height=60&width=60&query=student profile 3",
    major: "Business",
    year: "2026",
    mutualFriends: 15,
    isOnline: true,
    lastActive: "Active now",
  },
  {
    id: 4,
    name: "Daniel Wilson",
    username: "@daniel_w",
    avatar: "/placeholder.svg?height=60&width=60&query=student profile 4",
    major: "Psychology",
    year: "2025",
    mutualFriends: 6,
    isOnline: false,
    lastActive: "1 day ago",
  },
]

const suggestions = [
  {
    id: 5,
    name: "Jessica Lee",
    username: "@jessica_l",
    avatar: "/placeholder.svg?height=60&width=60&query=student profile 5",
    major: "Computer Science",
    year: "2025",
    mutualFriends: 5,
    reason: "Same major",
  },
  {
    id: 6,
    name: "Ryan Park",
    username: "@ryan_p",
    avatar: "/placeholder.svg?height=60&width=60&query=student profile 6",
    major: "Engineering",
    year: "2024",
    mutualFriends: 3,
    reason: "Mutual friends",
  },
  {
    id: 7,
    name: "Maya Patel",
    username: "@maya_p",
    avatar: "/placeholder.svg?height=60&width=60&query=student profile 7",
    major: "Computer Science",
    year: "2025",
    mutualFriends: 7,
    reason: "CS 101 classmate",
  },
]

const requests = [
  {
    id: 8,
    name: "Kevin Zhang",
    username: "@kevin_z",
    avatar: "/placeholder.svg?height=60&width=60&query=student profile 8",
    major: "Mathematics",
    year: "2024",
    mutualFriends: 2,
    requestDate: "2 days ago",
  },
]

export default function FriendsPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredFriends = friends.filter(
    (friend) =>
      friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      friend.username.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const sendFriendRequest = (userId: number) => {
    alert(`Friend request sent to user ${userId}! 🎉`)
  }

  const acceptRequest = (userId: number) => {
    alert(`Friend request accepted from user ${userId}! 🤝`)
  }

  const declineRequest = (userId: number) => {
    alert(`Friend request declined from user ${userId}`)
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
              <TabsTrigger value="requests">Requests ({requests.length})</TabsTrigger>
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
                            src={friend.avatar || "/placeholder.svg"}
                            alt={friend.name}
                            className="h-16 w-16 rounded-full object-cover"
                          />
                          {friend.isOnline && (
                            <div className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-green-500 ring-2 ring-background" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{friend.name}</h3>
                          <p className="text-sm text-muted-foreground">{friend.username}</p>
                          <p className="text-xs text-muted-foreground">
                            {friend.isOnline ? "🟢 Online" : `Last active ${friend.lastActive}`}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Major:</span>
                          <Badge variant="secondary">{friend.major}</Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Class of:</span>
                          <span>{friend.year}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Mutual friends:</span>
                          <span>{friend.mutualFriends}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Link href="/messages" className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            <MessageSquareIcon className="mr-2 h-4 w-4" />
                            Message
                          </Button>
                        </Link>
                        <Link href="/profile" className="flex-1">
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
                          src={person.avatar || "/placeholder.svg"}
                          alt={person.name}
                          className="h-16 w-16 rounded-full object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{person.name}</h3>
                          <p className="text-sm text-muted-foreground">{person.username}</p>
                          <Badge variant="outline" className="mt-1 text-xs">
                            {person.reason}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Major:</span>
                          <Badge variant="secondary">{person.major}</Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Class of:</span>
                          <span>{person.year}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Mutual friends:</span>
                          <span>{person.mutualFriends}</span>
                        </div>
                      </div>

                      <Button
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-600"
                        onClick={() => sendFriendRequest(person.id)}
                      >
                        <UserPlusIcon className="mr-2 h-4 w-4" />
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
                          src={request.avatar || "/placeholder.svg"}
                          alt={request.name}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                        <div>
                          <h4 className="font-semibold">{request.name}</h4>
                          <p className="text-sm text-muted-foreground">{request.username}</p>
                          <p className="text-xs text-muted-foreground">
                            {request.mutualFriends} mutual friends • {request.requestDate}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => declineRequest(request.id)}>
                          Decline
                        </Button>
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-green-500 to-blue-600"
                          onClick={() => acceptRequest(request.id)}
                        >
                          Accept
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
