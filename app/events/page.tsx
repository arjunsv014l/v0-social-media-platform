"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, ClockIcon, MapPinIcon, PlusIcon, UsersIcon } from "lucide-react"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"

const events = [
  {
    id: 1,
    title: "Campus Career Fair 2024",
    description: "Meet with top employers and explore internship opportunities. Over 100 companies attending!",
    date: "March 15, 2024",
    time: "10:00 AM - 4:00 PM",
    location: "Student Union Building",
    attendees: 245,
    category: "Career",
    image: "/placeholder.svg?height=200&width=400&query=career fair",
    isAttending: true,
  },
  {
    id: 2,
    title: "Spring Hackathon 🚀",
    description: "48-hour coding marathon with amazing prizes! Build the next big thing with your team.",
    date: "March 22-24, 2024",
    time: "6:00 PM Friday - 6:00 PM Sunday",
    location: "Engineering Building",
    attendees: 156,
    category: "Tech",
    image: "/placeholder.svg?height=200&width=400&query=hackathon coding",
    isAttending: false,
  },
  {
    id: 3,
    title: "Mental Health Awareness Week",
    description: "Join us for workshops, meditation sessions, and wellness activities throughout the week.",
    date: "March 18-22, 2024",
    time: "Various times",
    location: "Multiple locations",
    attendees: 89,
    category: "Wellness",
    image: "/placeholder.svg?height=200&width=400&query=mental health wellness",
    isAttending: true,
  },
  {
    id: 4,
    title: "International Food Festival",
    description: "Taste cuisines from around the world! Organized by international student clubs.",
    date: "March 20, 2024",
    time: "12:00 PM - 8:00 PM",
    location: "Campus Quad",
    attendees: 312,
    category: "Social",
    image: "/placeholder.svg?height=200&width=400&query=international food festival",
    isAttending: false,
  },
]

const myEvents = events.filter((event) => event.isAttending)

export default function EventsPage() {
  const [selectedCategory, setSelectedCategory] = useState("all")

  const filteredEvents =
    selectedCategory === "all" ? events : events.filter((event) => event.category.toLowerCase() === selectedCategory)

  const toggleAttendance = (eventId: number) => {
    // In a real app, this would update the database
    alert(`Attendance toggled for event ${eventId}`)
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
          <Button className="bg-gradient-to-r from-purple-500 to-pink-600">
            <PlusIcon className="mr-2 h-4 w-4" />
            Create Event
          </Button>
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
                <Button
                  variant={selectedCategory === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory("all")}
                >
                  All
                </Button>
                <Button
                  variant={selectedCategory === "career" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory("career")}
                >
                  Career
                </Button>
                <Button
                  variant={selectedCategory === "tech" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory("tech")}
                >
                  Tech
                </Button>
                <Button
                  variant={selectedCategory === "social" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory("social")}
                >
                  Social
                </Button>
                <Button
                  variant={selectedCategory === "wellness" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory("wellness")}
                >
                  Wellness
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event) => (
                  <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative">
                      <img
                        src={event.image || "/placeholder.svg"}
                        alt={event.title}
                        className="w-full h-48 object-cover"
                      />
                      <Badge className="absolute top-2 right-2" variant="secondary">
                        {event.category}
                      </Badge>
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
                        <ClockIcon className="h-4 w-4" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPinIcon className="h-4 w-4" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <UsersIcon className="h-4 w-4" />
                        <span>{event.attendees} attending</span>
                      </div>
                      <Button
                        className={`w-full ${
                          event.isAttending
                            ? "bg-green-500 hover:bg-green-600"
                            : "bg-gradient-to-r from-purple-500 to-pink-600"
                        }`}
                        onClick={() => toggleAttendance(event.id)}
                      >
                        {event.isAttending ? "✅ Attending" : "Join Event"}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="attending" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myEvents.map((event) => (
                  <Card key={event.id} className="overflow-hidden border-green-200 dark:border-green-800">
                    <div className="relative">
                      <img
                        src={event.image || "/placeholder.svg"}
                        alt={event.title}
                        className="w-full h-48 object-cover"
                      />
                      <Badge className="absolute top-2 right-2 bg-green-500">Attending ✅</Badge>
                    </div>
                    <CardHeader>
                      <CardTitle className="text-lg">{event.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{event.description}</p>
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
                      <Button variant="outline" className="w-full">
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="categories" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
                  <div className="text-4xl mb-2">💼</div>
                  <h3 className="font-semibold">Career</h3>
                  <p className="text-sm text-muted-foreground">Job fairs, networking</p>
                </Card>
                <Card className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
                  <div className="text-4xl mb-2">💻</div>
                  <h3 className="font-semibold">Tech</h3>
                  <p className="text-sm text-muted-foreground">Hackathons, workshops</p>
                </Card>
                <Card className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
                  <div className="text-4xl mb-2">🧘</div>
                  <h3 className="font-semibold">Wellness</h3>
                  <p className="text-sm text-muted-foreground">Mental health, fitness</p>
                </Card>
                <Card className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20">
                  <div className="text-4xl mb-2">🎉</div>
                  <h3 className="font-semibold">Social</h3>
                  <p className="text-sm text-muted-foreground">Parties, festivals</p>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </SidebarInset>
  )
}
