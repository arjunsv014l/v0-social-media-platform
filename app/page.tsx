"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BellIcon, MessageSquareIcon, PlusIcon, SearchIcon, Loader2 } from "lucide-react"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import NewPostCard from "@/components/new-post-card"
import PostCard from "@/components/post-card"
import TrendingSidebar from "@/components/trending-sidebar"
import { useAuth } from "@/contexts/auth-context"
import { useEffect, useState } from "react"
import type { PostWithAuthor } from "@/lib/supabase/types"
import { CreatePostDialog } from "@/components/create-post-dialog"
import { SearchDialog } from "@/components/search-dialog"
import { NotificationsPopover } from "@/components/notifications-popover"

// Mock posts data
const mockPosts: PostWithAuthor[] = [
  {
    id: "1",
    user_id: "mock-user-id",
    content:
      "Just finished my Computer Science project! 🎉 Working with React and TypeScript has been amazing. Can't wait to show it to everyone!",
    media_url: null,
    media_type: null,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    author: {
      id: "mock-user-id",
      email: "student@example.com",
      username: "student123",
      full_name: "John Student",
      user_type: "student" as const,
      avatar_url: "/placeholder.svg?height=40&width=40",
      role_description: "Computer Science 3rd year student",
      college_name: "Tech University",
      degree: "Computer Science",
      year_of_study: "3rd",
      updated_at: new Date().toISOString(),
    },
  },
  {
    id: "2",
    user_id: "mock-user-2",
    content:
      "Looking for study partners for the upcoming Data Structures exam. Anyone interested in forming a study group? 📚",
    media_url: null,
    media_type: null,
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    updated_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    author: {
      id: "mock-user-2",
      email: "sarah@example.com",
      username: "sarah_cs",
      full_name: "Sarah Johnson",
      user_type: "student" as const,
      avatar_url: "/placeholder.svg?height=40&width=40",
      role_description: "Computer Science 2nd year student",
      college_name: "Tech University",
      degree: "Computer Science",
      year_of_study: "2nd",
      updated_at: new Date().toISOString(),
    },
  },
  {
    id: "3",
    user_id: "mock-user-3",
    content:
      "Great lecture on Machine Learning today! Prof. Smith really knows how to explain complex concepts. Here's my notes summary for anyone who missed it.",
    media_url: "/placeholder.svg?height=300&width=400",
    media_type: "image",
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    updated_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    author: {
      id: "mock-user-3",
      email: "mike@example.com",
      username: "mike_ml",
      full_name: "Mike Chen",
      user_type: "student" as const,
      avatar_url: "/placeholder.svg?height=40&width=40",
      role_description: "Computer Science 4th year student",
      college_name: "Tech University",
      degree: "Computer Science",
      year_of_study: "4th",
      updated_at: new Date().toISOString(),
    },
  },
]

export default function Home() {
  const { user, profile } = useAuth()
  const [posts, setPosts] = useState<PostWithAuthor[]>(mockPosts)
  const [loadingPosts, setLoadingPosts] = useState(false)
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isNotificationsPopoverOpen, setIsNotificationsPopoverOpen] = useState(false)

  // Simulate loading posts
  useEffect(() => {
    setLoadingPosts(true)
    const timer = setTimeout(() => {
      setLoadingPosts(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <SidebarInset>
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="md:hidden" />
          <div className="hidden md:block">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Home Feed 🏠
            </h1>
          </div>
        </div>
        <div className="relative hidden md:block">
          <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search posts, people, events..."
            className="h-9 w-64 rounded-full border border-input bg-background pl-8 pr-4 text-sm focus:outline-none"
            onFocus={() => setIsSearchOpen(true)}
            readOnly
          />
        </div>
        <div className="flex items-center gap-2">
          <Button size="icon" variant="ghost" onClick={() => setIsSearchOpen(true)} className="md:hidden">
            <SearchIcon className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </Button>

          <NotificationsPopover open={isNotificationsPopoverOpen} onOpenChange={setIsNotificationsPopoverOpen}>
            <Button size="icon" variant="ghost" className="relative">
              <BellIcon className="h-5 w-5" />
              <span className="sr-only">Notifications</span>
            </Button>
          </NotificationsPopover>

          <Link href="/messages">
            <Button size="icon" variant="ghost" className="relative">
              <MessageSquareIcon className="h-5 w-5" />
              <span className="sr-only">Messages</span>
            </Button>
          </Link>

          <Button
            size="icon"
            className="bg-gradient-to-r from-blue-500 to-purple-600 md:hidden"
            onClick={() => setIsCreatePostOpen(true)}
          >
            <PlusIcon className="h-5 w-5" />
            <span className="sr-only">New post</span>
          </Button>

          <div className="flex items-center gap-2">
            <Link href="/profile">
              <Button size="sm" variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                <img
                  src={profile?.avatar_url || "/placeholder.svg?height=36&width=36&query=student profile"}
                  alt={profile?.full_name || "Profile"}
                  className="h-full w-full rounded-full object-cover"
                />
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 ring-1 ring-background" />
                <span className="sr-only">Profile</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <NewPostCard />

            {loadingPosts ? (
              <div className="flex justify-center items-center py-10">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                  <p className="mt-2 text-sm text-muted-foreground">Loading posts...</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} author={post.author} />
                ))}
              </div>
            )}
          </div>
          <div className="hidden lg:block">
            <TrendingSidebar />
          </div>
        </div>
      </main>

      <CreatePostDialog open={isCreatePostOpen} onOpenChange={setIsCreatePostOpen} />
      <SearchDialog open={isSearchOpen} onOpenChange={setIsSearchOpen} />
    </SidebarInset>
  )
}
