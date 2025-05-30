"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea" // Added Textarea import
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { createPost } from "@/lib/actions"
import { useAuth } from "@/context/AuthContext"
import { Loader2 } from "lucide-react" // Added Loader2 for loading state

export function CreatePostDialog() {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [isLoading, setIsLoading] = useState(false) // Added loading state
  const { toast } = useToast()
  const { user } = useAuth()

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Error",
        description: "Please fill in both title and content.",
        variant: "destructive",
      })
      return
    }

    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a post.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    const res = await createPost({
      title: title.trim(),
      content: content.trim(),
      authorId: user.id,
    })
    setIsLoading(false)

    if (res?.error) {
      toast({
        title: "Error Creating Post",
        description: res.error,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success!",
        description: "Post created successfully.",
      })
      setTitle("")
      setContent("")
      // Optionally, close the dialog here if it's controlled by an open/onOpenChange prop
      // For AlertDialog, it typically closes on AlertDialogAction unless prevented.
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline">Create Post</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Create a new post</AlertDialogTitle>
          <AlertDialogDescription>
            Share your thoughts, experiences, or updates with your campus community.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Your amazing post title"
              disabled={isLoading}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind? 💭"
              className="min-h-[120px]"
              disabled={isLoading}
            />
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Posting...
              </>
            ) : (
              "Post"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
