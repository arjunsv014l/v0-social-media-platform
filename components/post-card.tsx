"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { HeartIcon, MessageSquareIcon, MoreHorizontalIcon, RepeatIcon, ShareIcon } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import { formatDistanceToNow } from "date-fns"

interface PostCardProps {
  post: any
  author: any
}

export default function PostCard({ post, author }: PostCardProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(post.likes_count || 0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      checkIfLiked()
    }
  }, [user, post.id])

  const checkIfLiked = async () => {
    if (!user) return

    const { data } = await supabase.from("likes").select("id").eq("post_id", post.id).eq("user_id", user.id).single()

    setLiked(!!data)
  }

  const handleLike = async () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to like posts",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      if (liked) {
        // Unlike
        await supabase.from("likes").delete().eq("post_id", post.id).eq("user_id", user.id)

        await supabase
          .from("posts")
          .update({ likes_count: likeCount - 1 })
          .eq("id", post.id)

        setLikeCount(likeCount - 1)
        setLiked(false)
      } else {
        // Like
        await supabase.from("likes").insert({
          post_id: post.id,
          user_id: user.id,
        })

        await supabase
          .from("posts")
          .update({ likes_count: likeCount + 1 })
          .eq("id", post.id)

        setLikeCount(likeCount + 1)
        setLiked(true)

        // Create notification for post author
        if (post.user_id !== user.id) {
          await supabase.from("notifications").insert({
            user_id: post.user_id,
            type: "like",
            title: "New like",
            content: `${author.full_name} liked your post`,
          })
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update like",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center space-x-4 space-y-0 p-4">
        <img src={author.avatar_url || "/placeholder.svg"} alt={author.full_name} className="h-10 w-10 rounded-full" />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{author.full_name}</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">@{author.username}</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
          </p>
        </div>
        <Button variant="ghost" size="icon">
          <MoreHorizontalIcon className="h-4 w-4" />
          <span className="sr-only">More options</span>
        </Button>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="mb-4">{post.content}</p>
        {post.image_url && (
          <img src={post.image_url || "/placeholder.svg"} alt="Post image" className="w-full rounded-md" />
        )}
      </CardContent>
      <CardFooter className="px-4 py-2">
        <div className="flex w-full justify-between">
          <Button variant="ghost" size="sm" className="flex gap-1" onClick={handleLike} disabled={loading}>
            <HeartIcon className={`h-4 w-4 ${liked ? "fill-red-500 text-red-500" : ""}`} />
            <span>{likeCount}</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex gap-1">
            <MessageSquareIcon className="h-4 w-4" />
            <span>{post.comments_count || 0}</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex gap-1">
            <RepeatIcon className="h-4 w-4" />
            <span>{post.shares_count || 0}</span>
          </Button>
          <Button variant="ghost" size="sm">
            <ShareIcon className="h-4 w-4" />
            <span className="sr-only">Share</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
