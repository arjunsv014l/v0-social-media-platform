"use client"

import { useAuth } from "@/contexts/auth-context"
import { useEffect, useState, useRef, useCallback } from "react"
import { supabase } from "@/lib/supabase/client"
import { PostCard } from "@/components/post-card"
import { NewPostCard } from "@/components/new-post-card"
import { TrendingSidebar } from "@/components/trending-sidebar"
import { Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb"

interface Post {
  id: string
  content: string
  image_url?: string
  created_at: string
  user_id: string
  likes_count: number
  comments_count: number
  user_has_liked: boolean
  profiles: {
    full_name: string
    username: string
    avatar_url?: string
  }
}

export default function HomePage() {
  const { user, profile } = useAuth()
  const { toast } = useToast()
  const [posts, setPosts] = useState<Post[]>([])
  const [loadingPosts, setLoadingPosts] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const mountedRef = useRef(true)
  const fetchingRef = useRef(false)

  const fetchPosts = useCallback(
    async (showRefreshLoader = false) => {
      if (fetchingRef.current) return
      fetchingRef.current = true

      try {
        if (showRefreshLoader) setRefreshing(true)
        else setLoadingPosts(true)

        const { data, error } = await supabase
          .from("posts")
          .select(`
          *,
          profiles:user_id (
            full_name,
            username,
            avatar_url
          ),
          likes_count:post_likes(count),
          comments_count:post_comments(count),
          user_has_liked:post_likes!inner(user_id)
        `)
          .eq("post_likes.user_id", user?.id || "")
          .order("created_at", { ascending: false })
          .limit(20)

        if (error) throw error

        if (mountedRef.current) {
          setPosts(data || [])
        }
      } catch (error: any) {
        console.error("Error fetching posts:", error)
        if (mountedRef.current) {
          toast({
            title: "Error loading posts",
            description: error.message || "Failed to load posts. Please try again.",
            variant: "destructive",
          })
        }
      } finally {
        fetchingRef.current = false
        if (mountedRef.current) {
          setLoadingPosts(false)
          setRefreshing(false)
        }
      }
    },
    [user?.id, toast],
  )

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  useEffect(() => {
    if (!user) return

    fetchPosts()

    const channel = supabase
      .channel(`posts-${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "posts" }, () => {
        if (mountedRef.current) {
          setTimeout(() => fetchPosts(), 500)
        }
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "post_likes" }, () => {
        if (mountedRef.current) {
          setTimeout(() => fetchPosts(), 300)
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, fetchPosts])

  const handleRefresh = () => {
    fetchPosts(true)
  }

  const handlePostCreated = () => {
    fetchPosts(true)
  }

  if (!user || !profile) {
    return (
      <SidebarInset>
        <div className="flex h-screen items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">Loading your feed...</p>
          </div>
        </div>
      </SidebarInset>
    )
  }

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Home Feed</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <div className="container mx-auto max-w-2xl p-4">
            <div className="space-y-6">
              <NewPostCard onPostCreated={handlePostCreated} />

              {loadingPosts ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">Loading posts...</p>
                  </div>
                </div>
              ) : posts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No posts yet. Be the first to share something!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {posts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="hidden lg:block w-80 border-l">
          <TrendingSidebar />
        </div>
      </div>
    </SidebarInset>
  )
}
