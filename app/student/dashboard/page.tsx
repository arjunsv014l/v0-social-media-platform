"use client"

import React from "react"
import { useAuth } from "@/contexts/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  BookOpenText,
  CalendarDays,
  MessageSquare,
  Bell,
  UserCircle,
  GraduationCap,
  ExternalLink,
  ChevronRight,
  Loader2,
} from "lucide-react"
import Link from "next/link"

// Mock data interfaces
interface EnrolledCourse {
  id: string
  name: string
  code: string
  grade: string | null
  instructor: string
  materialsLink?: string
}

interface DashboardEvent {
  id: string
  title: string
  date: Date
  type: "deadline" | "event" | "holiday"
}

interface RecentMessage {
  id: string
  sender: string
  snippet: string
  avatarUrl?: string
  timestamp: string
  unread?: boolean
}

interface DashboardNotification {
  id: string
  title: string
  description: string
  timestamp: string
  read: boolean
  link?: string
}

// Mock Data
const mockEnrolledCourses: EnrolledCourse[] = [
  {
    id: "cse101",
    name: "Introduction to Computer Science",
    code: "CSE101",
    grade: "A",
    instructor: "Dr. Smith",
    materialsLink: "/courses/cse101/materials",
  },
  {
    id: "mat202",
    name: "Calculus II",
    code: "MAT202",
    grade: "B+",
    instructor: "Prof. Jones",
    materialsLink: "/courses/mat202/materials",
  },
  { id: "phy201", name: "University Physics I", code: "PHY201", grade: null, instructor: "Dr. Lee" },
  {
    id: "eng105",
    name: "Academic Writing",
    code: "ENG105",
    grade: "A-",
    instructor: "Ms. Davis",
    materialsLink: "/courses/eng105/materials",
  },
]

const today = new Date()
const mockEvents: DashboardEvent[] = [
  {
    id: "ev1",
    title: "Project Proposal Due",
    date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5),
    type: "deadline",
  },
  {
    id: "ev2",
    title: "Guest Lecture: AI Ethics",
    date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7),
    type: "event",
  },
  {
    id: "ev3",
    title: "Midterm Exams Start",
    date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 14),
    type: "deadline",
  },
  { id: "ev4", title: "Spring Break", date: new Date(today.getFullYear(), today.getMonth() + 1, 10), type: "holiday" },
]

const mockRecentMessages: RecentMessage[] = [
  {
    id: "msg1",
    sender: "Dr. Smith",
    snippet: "Reminder: Quiz on Friday covering...",
    avatarUrl: "/professor-avatar.png",
    timestamp: "10:30 AM",
    unread: true,
  },
  {
    id: "msg2",
    sender: "Study Group",
    snippet: "Are we meeting today at the library?",
    avatarUrl: "/group-icon.png",
    timestamp: "Yesterday",
  },
  {
    id: "msg3",
    sender: "Sarah Miller",
    snippet: "Can you share the notes from...",
    avatarUrl: "/student-avatar.png",
    timestamp: "2 days ago",
  },
]

const mockNotifications: DashboardNotification[] = [
  {
    id: "not1",
    title: "New Grade Posted",
    description: "Your grade for Calculus II Midterm has been posted.",
    timestamp: "2h ago",
    read: false,
    link: "/grades",
  },
  {
    id: "not2",
    title: "Library Hours Update",
    description: "The library will be closed this Sunday for maintenance.",
    timestamp: "1d ago",
    read: true,
  },
  {
    id: "not3",
    title: "Campus Event: Career Fair",
    description: "Don't miss the annual career fair next week!",
    timestamp: "3d ago",
    read: true,
    link: "/events/career-fair",
  },
]

export default function StudentDashboardPage() {
  const { profile, loading: authLoading } = useAuth()
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date())

  if (authLoading || !profile) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  if (profile.user_type !== "student") {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center text-center p-4">
        <UserCircle className="w-16 h-16 text-destructive mb-4" />
        <h1 className="text-2xl font-semibold mb-2">Access Denied</h1>
        <p className="text-muted-foreground">This dashboard is for students only.</p>
        <Button asChild className="mt-4">
          <Link href="/">Go to Home</Link>
        </Button>
      </div>
    )
  }

  const getEventTypeColor = (type: DashboardEvent["type"]) => {
    switch (type) {
      case "deadline":
        return "bg-red-500"
      case "event":
        return "bg-blue-500"
      case "holiday":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const upcomingEvents = mockEvents
    .filter((event) => event.date >= today)
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 3)

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6 lg:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome, {profile.full_name?.split(" ")[0] || "Student"}!
          </h1>
          <p className="text-muted-foreground">Here's your academic overview and quick access to resources.</p>
        </div>
        <Button asChild>
          <Link href="/profile">
            <UserCircle className="mr-2 h-4 w-4" /> View Profile
          </Link>
        </Button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column (Profile & Courses) - Spans 2 cols on lg */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">Profile Summary</CardTitle>
              <GraduationCap className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage
                  src={profile.avatar_url || "/placeholder.svg?width=64&height=64&query=student+avatar"}
                  alt={profile.full_name || "Student"}
                />
                <AvatarFallback>{profile.full_name?.charAt(0).toUpperCase() || "S"}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-xl font-semibold">{profile.full_name}</p>
                <p className="text-sm text-muted-foreground">Student ID: {profile.student_id_number || "N/A"}</p>
                <p className="text-sm text-muted-foreground">
                  Year: {profile.year_of_study || "N/A"} | Degree: {profile.degree || "N/A"}
                </p>
                <p className="text-sm text-muted-foreground">College: {profile.college || "N/A"}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpenText className="mr-2 h-5 w-5" /> Enrolled Courses
              </CardTitle>
              <CardDescription>Overview of your current courses and grades.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Instructor</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead className="text-right">Materials</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockEnrolledCourses.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell className="font-medium">{course.name}</TableCell>
                      <TableCell>{course.code}</TableCell>
                      <TableCell>{course.instructor}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            course.grade
                              ? course.grade.startsWith("A")
                                ? "default"
                                : course.grade.startsWith("B")
                                  ? "secondary"
                                  : "outline"
                              : "outline"
                          }
                        >
                          {course.grade || "Pending"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {course.materialsLink ? (
                          <Button variant="outline" size="sm" asChild>
                            <Link href={course.materialsLink}>
                              <ExternalLink className="h-3 w-3" />
                            </Link>
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" className="w-full text-primary" asChild>
                <Link href="/courses">
                  View All Courses <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Right Column (Calendar, Messages, Notifications) */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CalendarDays className="mr-2 h-5 w-5" /> Academic Calendar
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
                modifiers={{
                  events: mockEvents.map((e) => e.date),
                }}
                modifiersClassNames={{
                  events: "bg-primary text-primary-foreground rounded-full",
                }}
              />
              <Separator className="my-4" />
              <h4 className="text-sm font-medium mb-2 self-start">Upcoming Deadlines & Events:</h4>
              {upcomingEvents.length > 0 ? (
                <ul className="space-y-2 w-full">
                  {upcomingEvents.map((event) => (
                    <li key={event.id} className="flex items-center text-sm">
                      <span className={`w-2 h-2 rounded-full mr-2 ${getEventTypeColor(event.type)}`}></span>
                      <span className="flex-grow">{event.title}</span>
                      <span className="text-muted-foreground text-xs">
                        {event.date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No upcoming events in the near future.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="mr-2 h-5 w-5" /> Recent Messages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[150px]">
                <div className="space-y-3">
                  {mockRecentMessages.map((msg) => (
                    <div key={msg.id} className="flex items-start space-x-3 p-2 hover:bg-accent rounded-md">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={msg.avatarUrl || "/placeholder.svg"} />
                        <AvatarFallback>{msg.sender.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <p className={`text-sm font-medium ${msg.unread ? "text-primary" : ""}`}>{msg.sender}</p>
                          <p className="text-xs text-muted-foreground">{msg.timestamp}</p>
                        </div>
                        <p className={`text-xs ${msg.unread ? "text-foreground" : "text-muted-foreground"} truncate`}>
                          {msg.snippet}
                        </p>
                      </div>
                      {msg.unread && <span className="w-2 h-2 bg-primary rounded-full self-center ml-2"></span>}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" className="w-full text-primary" asChild>
                <Link href="/messages">
                  View All Messages <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="mr-2 h-5 w-5" /> Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[150px]">
                <div className="space-y-3">
                  {mockNotifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-2 rounded-md ${!notif.read ? "bg-primary/10" : "hover:bg-accent"}`}
                    >
                      <div className="flex justify-between items-center">
                        <p className={`text-sm font-medium ${!notif.read ? "text-primary" : ""}`}>{notif.title}</p>
                        <p className="text-xs text-muted-foreground">{notif.timestamp}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">{notif.description}</p>
                      {notif.link && (
                        <Link href={notif.link} className="text-xs text-blue-600 hover:underline">
                          View Details
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" className="w-full text-primary" asChild>
                <Link href="/notifications">
                  View All Notifications <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
