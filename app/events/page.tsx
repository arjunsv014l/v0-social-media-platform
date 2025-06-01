"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, ClockIcon, MapPinIcon, PlusIcon, UsersIcon, Loader2, Edit3Icon } from "lucide-react"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import { CreateEventDialog } from "@/components/create-event-dialog" // We'll create this
import type { Event, Profile } from "@/lib/supabase/types" // Assuming types are defined

interface EventWithAttendance extends Event {
  isAttending?: boolean
  creator?: Profile | null
}

export default function EventsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [allEvents, setAllEvents] = useState<EventWithAttendance[]>([])
  const [myEventIds, setMyEventIds] = useState<Set<string>>(new Set())
  const [loadingEvents, setLoadingEvents] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [isCreateEventDialogOpen, setIsCreateEventDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<EventWithAttendance | null>(null)

  const fetchEvents = useCallback(async () => {
    setLoadingEvents(true)
    const { data: eventsData, error: eventsError } = await supabase
      .from("events")
      .select("*, creator:profiles!creator_id(*)") // Fetch creator profile
      .order("created_at", { ascending: false })

    if (eventsError) {
      console.error("Error fetching events:", eventsError)
      toast({ title: "Error", description: "Could not load events.", variant: "destructive" })
      setAllEvents([])
      setLoadingEvents(false)
      return
    }

    if (!user?.id) {
      setAllEvents(eventsData.map((e) => ({ ...e, creator: e.creator as Profile | null })) || [])
      setLoadingEvents(false)
      return
    }

    const { data: attendanceData, error: attendanceError } = await supabase
      .from("event_attendees")
      .select("event_id")
      .eq("user_id", user.id)

    if (attendanceError) {
      console.error("Error fetching event attendance:", attendanceError)
      // Continue without attendance data if it fails
    }

    const attendedIds = new Set(attendanceData?.map((a) => a.event_id) || [])
    setMyEventIds(attendedIds)

    const eventsWithAttendanceStatus = eventsData.map((event) => ({
      ...event,
      creator: event.creator as Profile | null,
      isAttending: attendedIds.has(event.id),
    }))

    setAllEvents(eventsWithAttendanceStatus)
    setLoadingEvents(false)
  }, [user?.id, toast])

  useEffect(() => {
    fetchEvents()

    const eventsChannel = supabase
      .channel("realtime-events")
      .on("postgres_changes", { event: "*", schema: "public", table: "events" }, fetchEvents)
      .on("postgres_changes", { event: "*", schema: "public", table: "event_attendees" }, fetchEvents)
      .subscribe()

    return () => {
      supabase.removeChannel(eventsChannel)
    }
  }, [fetchEvents])

  const handleToggleAttendance = async (event: EventWithAttendance) => {
    if (!user?.id) {
      toast({ title: "Authentication Required", description: "Please log in to join events.", variant: "default" })
      return
    }

    const currentlyAttending = myEventIds.has(event.id)
    let newAttendeesCount = event.attendees_count || 0

    if (currentlyAttending) {
      // Optimistically update UI
      setMyEventIds((prev) => {
        const newSet = new Set(prev)
        newSet.delete(event.id)
        return newSet
      })
      setAllEvents((prev) =>
        prev.map((e) =>
          e.id === event.id ? { ...e, isAttending: false, attendees_count: (e.attendees_count || 1) - 1 } : e,
        ),
      )
      newAttendeesCount = Math.max(0, newAttendeesCount - 1)

      const { error } = await supabase.from("event_attendees").delete().match({ event_id: event.id, user_id: user.id })
      if (error) {
        toast({ title: "Error", description: "Failed to leave event.", variant: "destructive" })
        fetchEvents() // Revert optimistic update
      }
    } else {
      // Optimistically update UI
      setMyEventIds((prev) => new Set(prev).add(event.id))
      setAllEvents((prev) =>
        prev.map((e) =>
          e.id === event.id ? { ...e, isAttending: true, attendees_count: (e.attendees_count || 0) + 1 } : e,
        ),
      )
      newAttendeesCount = newAttendeesCount + 1

      const { error } = await supabase.from("event_attendees").insert({ event_id: event.id, user_id: user.id })
      if (error) {
        toast({ title: "Error", description: "Failed to join event.", variant: "destructive" })
        fetchEvents() // Revert optimistic update
      }
    }
    // Update attendees_count in events table
    const { error: updateCountError } = await supabase
      .from("events")
      .update({ attendees_count: newAttendeesCount })
      .eq("id", event.id)

    if (updateCountError) {
      console.error("Error updating event attendees count:", updateCountError)
      // Optionally handle this error, though the primary action (join/leave) might have succeeded
    }
  }

  const filteredEvents =
    selectedCategory === "all"
      ? allEvents
      : allEvents.filter((event) => event.category?.toLowerCase() === selectedCategory)

  const myEvents = allEvents.filter((event) => myEventIds.has(event.id))

  const handleEventCreated = () => {
    fetchEvents() // Refresh events list after creation
  }

  const handleEditEvent = (event: EventWithAttendance) => {
    setEditingEvent(event)
    setIsCreateEventDialogOpen(true)
  }

  return (
    <SidebarInset>
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="md:hidden" />
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Campus Events 🎉
              </h1>
              <p className="text-sm text-muted-foreground hidden md:block">
                Discover and join amazing events happening on campus
              </p>
            </div>
          </div>
          {user && (
            <Button
              className="bg-gradient-to-r from-purple-500 to-pink-600"
              onClick={() => {
                setEditingEvent(null) // Clear editing event for new creation
                setIsCreateEventDialogOpen(true)
              }}
            >
              <PlusIcon className="mr-2 h-4 w-4" />
              Create Event
            </Button>
          )}
        </header>

        <div className="container mx-auto px-4 py-6">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="all">All Events</TabsTrigger>
              <TabsTrigger value="attending">My Events ({myEvents.length})</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-6">
              <div className="flex gap-2 mb-4 flex-wrap">
                {["all", "Career", "Tech", "Social", "Wellness", "Academic", "Arts", "Sports"].map((cat) => (
                  <Button
                    key={cat}
                    variant={selectedCategory === cat.toLowerCase() ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(cat.toLowerCase())}
                    className="capitalize"
                  >
                    {cat}
                  </Button>
                ))}
              </div>

              {loadingEvents ? (
                <div className="flex justify-center items-center py-10">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
              ) : filteredEvents.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">No events found for this category.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredEvents.map((event) => (
                    <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
                      <div className="relative">
                        <img
                          src={event.image_url || `/placeholder.svg?height=200&width=400&query=${event.category} event`}
                          alt={event.title}
                          className="w-full h-48 object-cover"
                        />
                        {event.category && (
                          <Badge className="absolute top-2 right-2" variant="secondary">
                            {event.category}
                          </Badge>
                        )}
                      </div>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg line-clamp-2">{event.title}</CardTitle>
                        <p className="text-sm text-muted-foreground line-clamp-3 h-[60px]">{event.description}</p>
                      </CardHeader>
                      <CardContent className="space-y-3 flex-grow flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CalendarIcon className="h-4 w-4 flex-shrink-0" />
                            <span>{event.date}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <ClockIcon className="h-4 w-4 flex-shrink-0" />
                            <span>{event.time}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPinIcon className="h-4 w-4 flex-shrink-0" />
                            <span>{event.location}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <UsersIcon className="h-4 w-4 flex-shrink-0" />
                            <span>{event.attendees_count || 0} attending</span>
                          </div>
                          {event.creator && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Created by: {event.creator.full_name || event.creator.username}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-auto pt-3">
                          {user && (
                            <Button
                              className={`w-full ${
                                event.isAttending
                                  ? "bg-green-600 hover:bg-green-700"
                                  : "bg-gradient-to-r from-purple-500 to-pink-600 hover:opacity-90"
                              }`}
                              onClick={() => handleToggleAttendance(event)}
                              disabled={!user}
                            >
                              {event.isAttending ? "✅ Attending" : "Join Event"}
                            </Button>
                          )}
                          {user && user.id === event.creator_id && (
                            <Button variant="outline" size="icon" onClick={() => handleEditEvent(event)}>
                              <Edit3Icon className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="attending" className="space-y-6">
              {loadingEvents ? (
                <div className="flex justify-center items-center py-10">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
              ) : myEvents.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">You are not attending any events yet.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myEvents.map((event) => (
                    <Card key={event.id} className="overflow-hidden border-green-200 dark:border-green-800">
                      <div className="relative">
                        <img
                          src={event.image_url || `/placeholder.svg?height=200&width=400&query=${event.category} event`}
                          alt={event.title}
                          className="w-full h-48 object-cover"
                        />
                        <Badge className="absolute top-2 right-2 bg-green-500 text-white">Attending ✅</Badge>
                      </div>
                      <CardHeader>
                        <CardTitle className="text-lg">{event.title}</CardTitle>
                        <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CalendarIcon className="h-4 w-4" />
                          <span>{event.date}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPinIcon className="h-4 w-4" />
                          <span>{event.location}</span>
                        </div>
                        <Button variant="outline" className="w-full" onClick={() => handleToggleAttendance(event)}>
                          Leave Event
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="categories" className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[
                  {
                    name: "Career",
                    emoji: "💼",
                    color: "from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20",
                  },
                  {
                    name: "Tech",
                    emoji: "💻",
                    color: "from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20",
                  },
                  {
                    name: "Wellness",
                    emoji: "🧘",
                    color: "from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20",
                  },
                  {
                    name: "Social",
                    emoji: "🎉",
                    color: "from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20",
                  },
                  {
                    name: "Academic",
                    emoji: "📚",
                    color: "from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20",
                  },
                  {
                    name: "Arts",
                    emoji: "🎨",
                    color: "from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20",
                  },
                  {
                    name: "Sports",
                    emoji: "⚽",
                    color: "from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20",
                  },
                  {
                    name: "Other",
                    emoji: "✨",
                    color: "from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20",
                  },
                ].map((cat) => (
                  <Card
                    key={cat.name}
                    className={`p-6 text-center hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br ${cat.color}`}
                    onClick={() => {
                      const tabs = document.querySelector('[role="tablist"]')
                      const allEventsTab = tabs?.querySelector(
                        '[data-state="inactive"][value="all"]',
                      ) as HTMLElement | null
                      if (allEventsTab) allEventsTab.click()
                      setSelectedCategory(cat.name.toLowerCase())
                    }}
                  >
                    <div className="text-4xl mb-2">{cat.emoji}</div>
                    <h3 className="font-semibold">{cat.name}</h3>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      {user && (
        <CreateEventDialog
          open={isCreateEventDialogOpen}
          onOpenChange={setIsCreateEventDialogOpen}
          onEventCreated={handleEventCreated}
          eventToEdit={editingEvent}
        />
      )}
    </SidebarInset>
  )
}
