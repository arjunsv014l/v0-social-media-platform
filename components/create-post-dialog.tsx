"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { ImageIcon, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"

interface CreatePostDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreatePostDialog({ open, onOpenChange }: CreatePostDialogProps) {
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !content.trim()) return

    setLoading(true)
    try {
      const { error } = await supabase.from("posts").insert({
        user_id: user.id,
        content: content.trim(),
      })

      if (error) throw error

      toast({
        title: "Post created! 🎉",
        description: "Your post has been shared with your network.",
      })

      setContent("")
      onOpenChange(false)

      // Trigger a page refresh to show the new post
      window.location.reload()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create post",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create a new post</DialogTitle>
            <DialogDescription>
              Share your thoughts, experiences, or updates with your campus community
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Textarea
              placeholder="What's on your mind? 💭"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[150px] resize-none"
              disabled={loading}
            />
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" disabled={loading}>
                <ImageIcon className="mr-2 h-4 w-4" />
                Add Image
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!content.trim() || loading}
              className="bg-gradient-to-r from-blue-500 to-purple-600"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Posting...
                </>
              ) : (
                "Post"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
