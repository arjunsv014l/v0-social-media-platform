"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { CalendarIcon, ImageIcon, MapPinIcon, SmileIcon } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { CreatePostDialog } from "@/components/create-post-dialog"

export default function NewPostCard() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const { profile } = useAuth()

  return (
    <>
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <img
              src={profile?.avatar_url || "/placeholder.svg?height=40&width=40&query=student profile"}
              alt="Your profile"
              className="h-10 w-10 rounded-full"
            />
            <div className="flex-1 cursor-pointer" onClick={() => setDialogOpen(true)}>
              <div className="rounded-lg border px-3 py-2 text-muted-foreground hover:bg-accent">
                What's happening on campus?
              </div>
            </div>
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
          <Button className="rounded-full" onClick={() => setDialogOpen(true)}>
            Post
          </Button>
        </CardFooter>
      </Card>
      <CreatePostDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  )
}
