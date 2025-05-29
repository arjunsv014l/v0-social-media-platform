"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { HeartIcon, MessageSquareIcon, MoreHorizontalIcon, RepeatIcon, ShareIcon } from "lucide-react"

interface PostCardProps {
  avatar: string
  name: string
  handle: string
  timestamp: string
  content: string
  image?: string
  likes: string
  comments: string
  shares: string
}

export default function PostCard({
  avatar,
  name,
  handle,
  timestamp,
  content,
  image,
  likes,
  comments,
  shares,
}: PostCardProps) {
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(Number.parseInt(likes))

  const handleLike = () => {
    if (liked) {
      setLikeCount(likeCount - 1)
    } else {
      setLikeCount(likeCount + 1)
    }
    setLiked(!liked)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center space-x-4 space-y-0 p-4">
        <img src={avatar || "/placeholder.svg"} alt={name} className="h-10 w-10 rounded-full" />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{name}</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">{handle}</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">{timestamp}</p>
        </div>
        <Button variant="ghost" size="icon">
          <MoreHorizontalIcon className="h-4 w-4" />
          <span className="sr-only">More options</span>
        </Button>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="mb-4">{content}</p>
        {image && <img src={image || "/placeholder.svg"} alt="Post image" className="w-full rounded-md" />}
      </CardContent>
      <CardFooter className="px-4 py-2">
        <div className="flex w-full justify-between">
          <Button variant="ghost" size="sm" className="flex gap-1" onClick={handleLike}>
            <HeartIcon className={`h-4 w-4 ${liked ? "fill-red-500 text-red-500" : ""}`} />
            <span>{likeCount}</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex gap-1">
            <MessageSquareIcon className="h-4 w-4" />
            <span>{comments}</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex gap-1">
            <RepeatIcon className="h-4 w-4" />
            <span>{shares}</span>
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
