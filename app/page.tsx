"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase/client"
import PostCard from "@/components/post-card"
import NewPostCard from "@/components/new-post-card"
import TrendingSidebar from "@/components/trending-sidebar"
import { Loader2 } from "lucide-react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb"

interface Post {
  id: string
  content: string
  image_url?: string
  video_url?: string
  created_at: string
  user_id: string
  likes_count: number
  comments_count: number
  shares_count: number
  profiles: {
    id: string
    username: string
    full_name: string
    avatar_url?: string
  }
  user_has_liked: boolean
}

export default function HomePage() {
  const { user, profile } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [loadingPosts, setLoadingPosts] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const mountedRef = useRef(true)
  const fetchingRef = useRef(false)

  const fetchPosts = useCallback(async () => {
    if (fetchingRef.current || !user) return

    fetchingRef.current = true
    console.log("HomePage: Fetching posts...")

    try {
      const { data: postsData, error: postsError } = await supabase
        .from("posts")
        .select(`
          *,
          profiles:user_id (
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .order("created_at", { ascending: false })
        .limit(20)

      if (postsError) {
        console.error("HomePage: Error fetching posts:", postsError)
        throw postsError
      }

      if (!mountedRef.current) return

      // Get likes for current user
      const postIds = postsData?.map((post) => post.id) || []
      const { data: likesData } = await supabase
        .from("post_likes")
        .select("post_id")
        .eq("user_id", user.id)
        .in("post_id", postIds)

      const likedPostIds = new Set(likesData?.map((like) => like.post_id) || [])

      // Get comments count for each post
      const { data: commentsData } = await supabase.from("post_comments").select("post_id").in("post_id", postIds)

      const commentsCount =
        commentsData?.reduce(
          (acc, comment) => {
            acc[comment.post_id] = (acc[comment.post_id] || 0) + 1
            return acc
          },
          {} as Record<string, number>,
        ) || {}

      // Get likes count for each post
      const { data: allLikesData } = await supabase.from("post_likes").select("post_id").in("post_id", postIds)

      const likesCount =
        allLikesData?.reduce(
          (acc, like) => {
            acc[like.post_id] = (acc[like.post_id] || 0) + 1
            return acc
          },
          {} as Record<string, number>,
        ) || {}

      const postsWithInteractions =
        postsData?.map((post) => ({
          ...post,
          user_has_liked: likedPostIds.has(post.id),
          comments_count: commentsCount[post.id] || 0,
          likes_count: likesCount[post.id] || 0,
          shares_count: 0, // TODO: Implement shares functionality
        })) || []

      if (mountedRef.current) {
        setPosts(postsWithInteractions)
        setError(null)
        console.log("HomePage: Posts loaded successfully:", postsWithInteractions.length)
      }
    } catch (error: any) {
      console.error("HomePage: Error in fetchPosts:", error)
      if (mountedRef.current) {
        setError(error.message || "Failed to load posts")
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

    if (user) {
      fetchPosts()
    }

    return () => {
      mountedRef.current = false
    }
  }, [user, fetchPosts])

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user) return

    console.log("HomePage: Setting up real-time subscriptions")

    const postsChannel = supabase
      .channel("posts-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "posts" }, (payload) => {
        console.log("HomePage: Posts change detected:", payload.eventType)

        // Debounce the fetch to avoid rapid-fire updates
        setTimeout(() => {
          if (mountedRef.current && !fetchingRef.current) {
            fetchPosts()
          }
        }, 1000)
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "post_likes" }, (payload) => {
        console.log("HomePage: Post likes change detected:", payload.eventType)

        // Update likes count locally for better UX
        if (payload.eventType === "INSERT" && payload.new) {
          setPosts((prev) =>
            prev.map((post) =>
              post.id === payload.new.post_id
                ? {
                    ...post,
                    likes_count: post.likes_count + 1,
                    user_has_liked: payload.new.user_id === user.id ? true : post.user_has_liked,
                  }
                : post,
            ),
          )
        } else if (payload.eventType === "DELETE" && payload.old) {
          setPosts((prev) =>
            prev.map((post) =>
              post.id === payload.old.post_id
                ? {
                    ...post,
                    likes_count: Math.max(0, post.likes_count - 1),
                    user_has_liked: payload.old.user_id === user.id ? false : post.user_has_liked,
                  }
                : post,
            ),
          )
        }
      })
      .subscribe()

    return () => {
      console.log("HomePage: Cleaning up subscriptions")
      supabase.removeChannel(postsChannel)
    }
  }, [user, fetchPosts])

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">Loading your feed...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
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
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <div className="container mx-auto max-w-2xl p-4 space-y-6">
            {profile && <NewPostCard />}

            {loadingPosts ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">Loading posts...</p>
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-500 mb-4">{error}</p>
                <button
                  onClick={() => {
                    setError(null)
                    setLoadingPosts(true)
                    fetchPosts()
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Try Again
                </button>
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No posts yet. Be the first to share something!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} author={post.profiles} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Trending Sidebar - Hidden on mobile */}
        <div className="hidden lg:block w-80 border-l">
          <TrendingSidebar />
        </div>
      </div>
    </div>
  )
}
