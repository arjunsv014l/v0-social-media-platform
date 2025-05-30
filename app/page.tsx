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
import { supabase } from "@/lib/supabase/client"
import type { PostWithAuthor } from "@/lib/supabase/types"

import { CreatePostDialog } from "@/components/create-post-dialog"
import { SearchDialog } from "@/components/search-dialog"
import { NotificationsPopover } from "@/components/notifications-popover" // Updated import

export default function Home() {
  const { user, profile, loading: authLoading } = useAuth() // Added profile here
  const [posts, setPosts] = useState<PostWithAuthor[]>([])
  const [loadingPosts, setLoadingPosts] = useState(true)

  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isNotificationsPopoverOpen, setIsNotificationsPopoverOpen] = useState(false) // State for popover

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

    const postChannel = supabase
      .channel("realtime-posts-home")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "posts" }, (payload) => {
        const fetchNewPost = async () => {
          const { data: newPostData, error: newPostError } = await supabase
            .from("posts")
            .select(`*, author:profiles!user_id(*)`)
            .eq("id", payload.new.id)
            .single()
          if (newPostError) {
            console.error("Error fetching new post:", newPostError)
          } else if (newPostData) {
            setPosts((currentPosts) => [newPostData as PostWithAuthor, ...currentPosts])
          }
        }
        fetchNewPost()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(postChannel)
    }
  }, [])

  if (authLoading && !user) {
    // Show loader only if auth is loading AND user is not yet available
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
            onFocus={() => setIsSearchOpen(true)}
            readOnly
          />
        </div>
        <div className="flex items-center gap-2">
          <Button size="icon" variant="ghost" onClick={() => setIsSearchOpen(true)} className="md:hidden">
            <SearchIcon className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </Button>

          {user && ( // Only show notifications if user is logged in
            <NotificationsPopover open={isNotificationsPopoverOpen} onOpenChange={setIsNotificationsPopoverOpen}>
              <Button
                size="icon"
                variant="ghost"
                className="relative"
                // onClick is handled by PopoverTrigger now
              >
                <BellIcon className="h-5 w-5" />
                {/* Badge count can be fetched here or from a context if needed globally in header */}
                <span className="sr-only">Notifications</span>
              </Button>
            </NotificationsPopover>
          )}

          {user && ( // Only show messages link if user is logged in
            <Link href="/messages">
              <Button size="icon" variant="ghost" className="relative">
                <MessageSquareIcon className="h-5 w-5" />
                <span className="sr-only">Messages</span>
              </Button>
            </Link>
          )}

          {user && ( // Only show create post button if user is logged in
            <Button
              size="icon"
              className="bg-gradient-to-r from-blue-500 to-purple-600 md:hidden"
              onClick={() => setIsCreatePostOpen(true)}
            >
              <PlusIcon className="h-5 w-5" />
              <span className="sr-only">New post</span>
            </Button>
          )}

          <div className="flex items-center gap-2">
            {user && profile ? ( // Check for profile as well
              <Link href="/profile">
                <Button size="sm" variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                  <img
                    src={profile.avatar_url || "/placeholder.svg?height=36&width=36&query=student profile"}
                    alt={profile.full_name || "Profile"}
                    className="h-full w-full rounded-full object-cover"
                  />
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 ring-1 ring-background" />
                  <span className="sr-only">Profile</span>
                </Button>
              </Link>
            ) : !user && !authLoading ? ( // Show login only if not loading and no user
              <Link href="/login">
                <Button variant="outline" size="sm" className="hidden md:flex">
                  Login
                </Button>
              </Link>
            ) : null}
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
      {/* NotificationsPopover is now triggered by its child button in the header */}
    </SidebarInset>
  )
}
