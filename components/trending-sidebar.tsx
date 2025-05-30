"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { useAuth } from "@/contexts/auth-context"
import type { Profile, Event } from "@/lib/supabase/types" // Assuming you have these types
import { Loader2 } from "lucide-react"

interface TrendingTopic {
  name: string
  count: number
}

export default function TrendingSidebar() {
  const { user } = useAuth()
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([])
  const [peopleYouMayKnow, setPeopleYouMayKnow] = useState<Profile[]>([])
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([])
  const [loadingEvents, setLoadingEvents] = useState(true)
  const [loadingPeople, setLoadingPeople] = useState(true)
  const [loadingTopics, setLoadingTopics] = useState(true)

  useEffect(() => {
    // Fetch Upcoming Events
    const fetchUpcomingEvents = async () => {
      setLoadingEvents(true)
      const today = new Date().toISOString()
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .gte("date", today) // Assuming 'date' is stored in a comparable format like YYYY-MM-DD
        .order("date", { ascending: true })
        .limit(3)
      if (error) console.error("Error fetching upcoming events:", error)
      else setUpcomingEvents(data || [])
      setLoadingEvents(false)
    }

    // Fetch People You May Know
    const fetchPeopleYouMayKnow = async () => {
      if (!user) {
        setLoadingPeople(false)
        return
      }
      setLoadingPeople(true)
      // Simple logic: fetch random profiles, excluding self and existing friends
      // This requires knowing existing friends, which is complex here.
      // For simplicity, fetch a few random profiles excluding the current user.
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .neq("id", user.id) // Exclude current user
        // Add more complex logic here, e.g., .neq('id', friendIds) if you fetch friend IDs
        .limit(3) // Using Supabase's implicit random order without .order() on unindexed columns
      // A better way for random is a database function or ordering by a random column if available
      if (error) console.error("Error fetching people you may know:", error)
      else setPeopleYouMayKnow(data || [])
      setLoadingPeople(false)
    }

    // Fetch Trending Topics (Simplified: using event categories as a proxy)
    const fetchTrendingTopics = async () => {
      setLoadingTopics(true)
      // Simplified: Get distinct categories from recent events or posts
      // Using event categories for now
      const { data, error } = await supabase.rpc("get_trending_event_categories", { limit_count: 4 }) // Assumes a DB function

      if (error) {
        console.error("Error fetching trending topics:", error)
        // Fallback: distinct categories from events table if RPC fails or not present
        const { data: catData, error: catError } = await supabase
          .from("events")
          .select("category", { count: "exact" })
          .limit(4) // This is not ideal for trending, just gets some categories

        if (catError) console.error("Error fetching categories as fallback:", catError)
        else setTrendingTopics(catData?.map((c) => ({ name: `#${c.category}`, count: c.count || 0 })) || [])
      } else {
        setTrendingTopics(data.map((t: any) => ({ name: `#${t.category}`, count: t.event_count })) || [])
      }
      setLoadingTopics(false)
    }

    fetchUpcomingEvents()
    if (user) fetchPeopleYouMayKnow()
    else setLoadingPeople(false)
    fetchTrendingTopics()
  }, [user])

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2 pt-4">
          <h3 className="font-semibold">Trending Topics</h3>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          {loadingTopics ? (
            <div className="flex justify-center items-center h-20">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : trendingTopics.length > 0 ? (
            <ul className="space-y-2">
              {trendingTopics.map((topic) => (
                <li key={topic.name}>
                  <Link href={`/search?q=${topic.name.replace("#", "")}`} className="block hover:bg-accent p-1 rounded">
                    <p className="text-sm font-medium">{topic.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{topic.count} posts</p>{" "}
                    {/* Adjust text if count is not posts */}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No trending topics right now.</p>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2 pt-4">
          <h3 className="font-semibold">Upcoming Events</h3>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          {loadingEvents ? (
            <div className="flex justify-center items-center h-20">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : upcomingEvents.length > 0 ? (
            <ul className="space-y-3">
              {upcomingEvents.map((event) => (
                <li key={event.id}>
                  <Link href={`/events/${event.id}`} className="block hover:bg-accent p-1 rounded">
                    <p className="text-sm font-medium">{event.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(event.date).toLocaleDateString()} - {event.time}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No upcoming events.</p>
          )}
          {upcomingEvents.length > 0 && (
            <Button variant="ghost" size="sm" className="mt-2 w-full text-sm as-child">
              <Link href="/events">View all events</Link>
            </Button>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2 pt-4">
          <h3 className="font-semibold">People You May Know</h3>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          {loadingPeople ? (
            <div className="flex justify-center items-center h-20">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : peopleYouMayKnow.length > 0 ? (
            <ul className="space-y-3">
              {peopleYouMayKnow.map((person) => (
                <li key={person.id} className="flex items-center justify-between">
                  <Link
                    href={`/profile/${person.username}`}
                    className="flex items-center gap-2 hover:bg-accent p-1 rounded flex-grow"
                  >
                    <img
                      src={person.avatar_url || `/placeholder.svg?height=32&width=32&query=profile ${person.username}`}
                      alt={person.full_name || "Profile"}
                      className="h-8 w-8 rounded-full"
                    />
                    <div>
                      <p className="text-sm font-medium">{person.full_name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">@{person.username}</p>
                    </div>
                  </Link>
                  {/* Add Follow button functionality here if needed */}
                  {/* <Button size="sm" variant="outline" className="h-8 text-xs ml-2">Follow</Button> */}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No suggestions right now.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
