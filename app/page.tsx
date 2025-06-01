"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BellIcon, MessageSquareIcon, PlusIcon, SearchIcon, Loader2, AlertCircle } from "lucide-react"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import NewPostCard from "@/components/new-post-card"
import PostCard from "@/components/post-card"
import TrendingSidebar from "@/components/trending-sidebar"
import { useAuth } from "@/contexts/auth-context"
import { useEffect, useState, useCallback, useRef } from "react"
import { supabase } from "@/lib/supabase/client"
import type { PostWithAuthor } from "@/lib/supabase/types"
import { CreatePostDialog } from "@/components/create-post-dialog"
import { SearchDialog } from "@/components/search-dialog"
import { NotificationsPopover } from "@/components/notifications-popover"
import { Card, CardContent } from "@/components/ui/card"

export default function Home() {
  const { user, profile, loading: authLoading, authChecked, error: authError } = useAuth()
  const [posts, setPosts] = useState<PostWithAuthor[]>([])
  const [loadingPosts, setLoadingPosts] = useState(false)
  const [postsError, setPostsError] = useState<string | null>(null)
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isNotificationsPopoverOpen, setIsNotificationsPopoverOpen] = useState(false)

  const mountedRef = useRef(true)
  const fetchingRef = useRef(false)

  const fetchPosts = useCallback(async () => {
    if (!user || fetchingRef.current) return

    fetchingRef.current = true
    setLoadingPosts(true)
    setPostsError(null)

    try {
      console.log("[HomePage] Fetching posts...")

      // Add timeout to prevent hanging
      const fetchPromise = supabase
        .from("posts")
        .select(`
          *,
          author:profiles!user_id(*)
        `)
        .order("created_at", { ascending: false })
        .limit(20)

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("Posts fetch timeout")), 10000)
      })

      const { data, error } = await Promise.race([fetchPromise, timeoutPromise])

      if (error) {
        console.error("[HomePage] Error fetching posts:", error)
        throw error
      }

      if (mountedRef.current) {
        setPosts((data as PostWithAuthor[]) || [])
        console.log("[HomePage] Posts loaded successfully:", data?.length || 0)
      }
    } catch (error: any) {
      console.error("[HomePage] Posts fetch failed:", error)
      if (mountedRef.current) {
        setPostsError(error.message || "Failed to load posts")
      }
    } finally {
      if (mountedRef.current) {
        setLoadingPosts(false)
      }
      fetchingRef.current = false
    }
  }, [user])

  useEffect(() => {
    mountedRef.current = true

    // Only fetch posts if auth is checked and we have a user
    if (!authChecked || !user || authError) {
      return
    }

    fetchPosts()

    // Set up realtime subscription with error handling
    const postChannel = supabase
      .channel("realtime-posts-home")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "posts" }, (payload) => {
        console.log("[HomePage] New post detected:", payload.new.id)

        const fetchNewPost = async () => {
          try {
            const { data: newPostData, error: newPostError } = await supabase
              .from("posts")
              .select(`*, author:profiles!user_id(*)`)
              .eq("id", payload.new.id)
              .single()

            if (newPostError) {
              console.error("[HomePage] Error fetching new post:", newPostError)
              return
            }

            if (newPostData && mountedRef.current) {
              setPosts((currentPosts) => [newPostData as PostWithAuthor, ...currentPosts])
            }
          } catch (error) {
            console.error("[HomePage] Exception fetching new post:", error)
          }
        }

        fetchNewPost()
      })
      .subscribe((status) => {
        console.log("[HomePage] Realtime subscription status:", status)
      })

    return () => {
      mountedRef.current = false
      supabase.removeChannel(postChannel)
    }
  }, [user, authChecked, authError, fetchPosts])

  // Show loading only if auth is still being checked
  if (!authChecked || (authLoading && !user && !authError)) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-2 text-sm text-muted-foreground">Loading your account...</p>
        </div>
      </div>
    )
  }

  // Show auth error if present
  if (authError) {
    return (
      <div className="flex h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-lg font-semibold mb-2">Authentication Error</h2>
              <p className="text-sm text-muted-foreground mb-4">{authError}</p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show posts error if present
  if (postsError) {
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
        </header>

        <main className="flex-1 p-4">
          <div className="mx-auto max-w-2xl">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <h2 className="text-lg font-semibold mb-2">Failed to Load Posts</h2>
                  <p className="text-sm text-muted-foreground mb-4">{postsError}</p>
                  <Button onClick={() => fetchPosts()}>Try Again</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </SidebarInset>
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

          {user && (
            <NotificationsPopover open={isNotificationsPopoverOpen} onOpenChange={setIsNotificationsPopoverOpen}>
              <Button size="icon" variant="ghost" className="relative">
                <BellIcon className="h-5 w-5" />
                <span className="sr-only">Notifications</span>
              </Button>
            </NotificationsPopover>
          )}

          {user && (
            <Link href="/messages">
              <Button size="icon" variant="ghost" className="relative">
                <MessageSquareIcon className="h-5 w-5" />
                <span className="sr-only">Messages</span>
              </Button>
            </Link>
          )}

          {user && (
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
            {user && profile ? (
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
            ) : !user && !authLoading ? (
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
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                  <p className="mt-2 text-sm text-muted-foreground">Loading posts...</p>
                </div>
              </div>
            ) : posts.length > 0 ? (
              <div className="space-y-4">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} author={post.author} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No posts yet. Be the first to share something!</p>
                {user && (
                  <Button className="mt-4" onClick={() => setIsCreatePostOpen(true)}>
                    Create Your First Post
                  </Button>
                )}
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
