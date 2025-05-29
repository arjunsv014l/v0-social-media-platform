"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { DialogTitle } from "@/components/ui/dialog"
import { CalendarIcon, GraduationCapIcon, UserIcon } from "lucide-react"
import { supabase } from "@/lib/supabase/client"

interface SearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [results, setResults] = useState({
    users: [] as any[],
    events: [] as any[],
    courses: [] as any[],
  })

  useEffect(() => {
    if (!search.trim()) {
      setResults({ users: [], events: [], courses: [] })
      return
    }

    const searchDatabase = async () => {
      // Search users
      const { data: users } = await supabase
        .from("profiles")
        .select("*")
        .or(`full_name.ilike.%${search}%,username.ilike.%${search}%`)
        .limit(5)

      // Search events
      const { data: events } = await supabase
        .from("events")
        .select("*")
        .or(`title.ilike.%${search}%,description.ilike.%${search}%`)
        .limit(5)

      // Search courses
      const { data: courses } = await supabase
        .from("courses")
        .select("*")
        .or(`name.ilike.%${search}%,code.ilike.%${search}%`)
        .limit(5)

      setResults({
        users: users || [],
        events: events || [],
        courses: courses || [],
      })
    }

    const debounce = setTimeout(searchDatabase, 300)
    return () => clearTimeout(debounce)
  }, [search])

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <DialogTitle className="sr-only">Search CampusConnect</DialogTitle>
      <CommandInput placeholder="Search for people, events, courses..." value={search} onValueChange={setSearch} />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {results.users.length > 0 && (
          <CommandGroup heading="People">
            {results.users.map((user) => (
              <CommandItem
                key={user.id}
                onSelect={() => {
                  router.push(`/profile/${user.id}`)
                  onOpenChange(false)
                }}
              >
                <UserIcon className="mr-2 h-4 w-4" />
                <span>{user.full_name}</span>
                <span className="ml-2 text-sm text-muted-foreground">@{user.username}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {results.events.length > 0 && (
          <CommandGroup heading="Events">
            {results.events.map((event) => (
              <CommandItem
                key={event.id}
                onSelect={() => {
                  router.push(`/events/${event.id}`)
                  onOpenChange(false)
                }}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                <span>{event.title}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {results.courses.length > 0 && (
          <CommandGroup heading="Courses">
            {results.courses.map((course) => (
              <CommandItem
                key={course.id}
                onSelect={() => {
                  router.push(`/courses/${course.id}`)
                  onOpenChange(false)
                }}
              >
                <GraduationCapIcon className="mr-2 h-4 w-4" />
                <span>
                  {course.code}: {course.name}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  )
}
