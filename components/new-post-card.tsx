"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { CalendarIcon, ImageIcon, MapPinIcon, SmileIcon } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"

export default function NewPostCard() {
  const [post, setPost] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would send the post to the server
    alert(`Post submitted: ${post}`)
    setPost("")
  }

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <img
              src="/placeholder.svg?height=40&width=40&query=student profile"
              alt="Your profile"
              className="h-10 w-10 rounded-full"
            />
            <Textarea
              placeholder="What's happening on campus?"
              className="flex-1 resize-none border-none bg-transparent p-0 focus-visible:ring-0"
              value={post}
              onChange={(e) => setPost(e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t p-4">
          <div className="flex gap-2">
            <Button type="button" variant="ghost" size="icon" className="rounded-full">
              <ImageIcon className="h-4 w-4" />
              <span className="sr-only">Add image</span>
            </Button>
            <Button type="button" variant="ghost" size="icon" className="rounded-full">
              <MapPinIcon className="h-4 w-4" />
              <span className="sr-only">Add location</span>
            </Button>
            <Button type="button" variant="ghost" size="icon" className="rounded-full">
              <CalendarIcon className="h-4 w-4" />
              <span className="sr-only">Schedule</span>
            </Button>
            <Button type="button" variant="ghost" size="icon" className="rounded-full">
              <SmileIcon className="h-4 w-4" />
              <span className="sr-only">Add emoji</span>
            </Button>
          </div>
          <Button type="submit" className="rounded-full" disabled={!post.trim()}>
            Post
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
