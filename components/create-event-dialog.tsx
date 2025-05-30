"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import type { Event } from "@/lib/supabase/types"

interface CreateEventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onEventCreated: () => void
  eventToEdit?: Event | null
}

const eventCategories = ["Career", "Tech", "Social", "Wellness", "Academic", "Arts", "Sports", "Other"]

export function CreateEventDialog({ open, onOpenChange, onEventCreated, eventToEdit }: CreateEventDialogProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [location, setLocation] = useState("")
  const [category, setCategory] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (eventToEdit) {
      setTitle(eventToEdit.title)
      setDescription(eventToEdit.description)
      setDate(eventToEdit.date) // Assuming date is stored as YYYY-MM-DD string
      setTime(eventToEdit.time)
      setLocation(eventToEdit.location)
      setCategory(eventToEdit.category || "")
      setImageUrl(eventToEdit.image_url || "")
    } else {
      // Reset form for new event
      setTitle("")
      setDescription("")
      setDate("")
      setTime("")
      setLocation("")
      setCategory("")
      setImageUrl("")
    }
  }, [eventToEdit, open]) // Reset form when dialog opens or eventToEdit changes

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast({ title: "Error", description: "You must be logged in to create an event.", variant: "destructive" })
      return
    }
    if (!title || !description || !date || !time || !location || !category) {
      toast({ title: "Error", description: "Please fill in all required fields.", variant: "destructive" })
      return
    }

    setLoading(true)
    const eventData = {
      title,
      description,
      date,
      time,
      location,
      category,
      image_url: imageUrl || null,
      creator_id: user.id,
      // attendees_count is handled by triggers or separate updates
    }

    try {
      let error
      if (eventToEdit) {
        // Update existing event
        const { error: updateError } = await supabase.from("events").update(eventData).eq("id", eventToEdit.id)
        error = updateError
      } else {
        // Create new event
        const { error: insertError } = await supabase.from("events").insert(eventData)
        error = insertError
      }

      if (error) throw error

      toast({
        title: `Event ${eventToEdit ? "Updated" : "Created"}! 🎉`,
        description: `Your event has been successfully ${eventToEdit ? "updated" : "published"}.`,
      })
      onEventCreated()
      onOpenChange(false)
    } catch (error: any) {
      console.error(`Error ${eventToEdit ? "updating" : "creating"} event:`, error)
      toast({
        title: "Error",
        description: error.message || `Failed to ${eventToEdit ? "update" : "create"} event.`,
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
            <DialogTitle>{eventToEdit ? "Edit Event" : "Create a New Event"}</DialogTitle>
            <DialogDescription>
              {eventToEdit
                ? "Update the details for your event."
                : "Fill in the details to share your event with the campus."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
            <div className="space-y-1.5">
              <Label htmlFor="title">Event Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Campus Hackathon"
                disabled={loading}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell us more about the event..."
                className="min-h-[100px]"
                disabled={loading}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Student Union Building, Room 201"
                disabled={loading}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory} disabled={loading}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {eventCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="imageUrl">Image URL (Optional)</Label>
              <Input
                id="imageUrl"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/event-image.png"
                disabled={loading}
              />
            </div>
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-gradient-to-r from-purple-500 to-pink-600">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {eventToEdit ? "Updating..." : "Creating..."}
                </>
              ) : eventToEdit ? (
                "Save Changes"
              ) : (
                "Create Event"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
