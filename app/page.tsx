"use client" // Make this a client component to manage dialog states

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BellIcon, MessageSquareIcon, PlusIcon, SearchIcon, Loader2 } from "lucide-react"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import NewPostCard from "@/components/new-post-card"
import PostCard from "@/components/post-card"
import TrendingSidebar from "@/components/trending-sidebar"
import { useAuth } from "@/contexts/auth-context"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import type { PostWithAuthor } from "@/lib/supabase/types" // Assuming you have this type

// Dialogs and Popovers that were in AppSidebar, now potentially controlled here or via AppSidebar's context
import { CreatePostDialog } from "@/components/create-post-dialog"
import { SearchDialog } from "@/components/search-dialog"
import { NotificationsPopover } from "@/components/notifications-popover"

export default function Home() {
  const { user, loading: authLoading } = useAuth()
  const [posts, setPosts] = useState<PostWithAuthor[]>([])
  const [loadingPosts, setLoadingPosts] = useState(true)

  // States for dialogs/popovers triggered from header
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [notificationsAnchor, setNotificationsAnchor] = useState<HTMLElement | null>(null)

  useEffect(() => {
    const fetchPosts = async () => {
      setLoadingPosts(true)
      const { data, error } = await supabase
        .from("posts")
        .select(
          `
          *,
          author:profiles!user_id(*)
        `,
        )
        .order("created_at", { ascending: false })
        .limit(20)

      if (error) {
        console.error("Error fetching posts:", error)
        setPosts([])
      } else {
        setPosts((data as PostWithAuthor[]) || [])
      }
      setLoadingPosts(false)
    }

    fetchPosts()

    // Real-time subscription for new posts
    const postChannel = supabase
      .channel("realtime-posts")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "posts" }, (payload) => {
        // Fetch the new post with author info
        const fetchNewPost = async () => {
          const { data: newPost, error: newPostError } = await supabase
            .from("posts")
            .select(`*, author:profiles!user_id(*)`)
            .eq("id", payload.new.id)
            .single()
          if (newPostError) {
            console.error("Error fetching new post:", newPostError)
          } else if (newPost) {
            setPosts((currentPosts) => [newPost as PostWithAuthor, ...currentPosts])
          }
        }
        fetchNewPost()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(postChannel)
    }
  }, [])

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

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
            onFocus={() => setIsSearchOpen(true)} // Open dialog on focus
            readOnly // To prevent typing directly if search is a dialog
          />
        </div>
        <div className="flex items-center gap-2">
          <Button size="icon" variant="ghost" onClick={() => setIsSearchOpen(true)}>
            <SearchIcon className="h-5 w-5 md:hidden" />
            <span className="sr-only">Search</span>
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="relative"
            onClick={(e) => {
              setNotificationsAnchor(e.currentTarget)
              setIsNotificationsOpen(true)
            }}
            id="notifications-trigger-header"
          >
            <BellIcon className="h-5 w-5" />
            {/* Badge count can be fetched here or from a context if needed globally in header */}
            {/* <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">3</span> */}
            <span className="sr-only">Notifications</span>
          </Button>
          <Link href="/messages">
            <Button size="icon" variant="ghost" className="relative">
              <MessageSquareIcon className="h-5 w-5" />
              {/* Badge count can be fetched here or from a context */}
              {/* <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-blue-500 text-xs text-white flex items-center justify-center">2</span> */}
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
            {user ? (
              <Link href="/profile">
                <Button size="sm" variant="ghost" className="relative h-9 w-9 rounded-full">
                  <img
                    src={user.user_metadata?.avatar_url || "/placeholder.svg?height=36&width=36&query=student profile"}
                    alt="Profile"
                    className="h-9 w-9 rounded-full object-cover"
                  />
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 ring-1 ring-background" />
                  <span className="sr-only">Profile</span>
                </Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button variant="outline" size="sm" className="hidden md:flex">
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 p-4">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {user && <NewPostCard />}
            {loadingPosts ? (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : posts.length > 0 ? (
              <div className="space-y-4">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} author={post.author} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No posts yet. Be the first to share something or follow others!
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
      <NotificationsPopover
        open={isNotificationsOpen}
        onOpenChange={setIsNotificationsOpen}
        triggerElement={notificationsAnchor}
      />
    </SidebarInset>
  )
}
