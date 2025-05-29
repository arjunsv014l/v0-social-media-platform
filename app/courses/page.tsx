"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpenIcon, CalendarIcon, ClockIcon, GraduationCapIcon, PlusIcon, UsersIcon } from "lucide-react"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"

const courses = [
  {
    id: 1,
    code: "CS 101",
    name: "Introduction to Algorithms",
    professor: "Dr. Sarah Chen",
    credits: 3,
    schedule: "MWF 10:00-11:00 AM",
    location: "Engineering Building 201",
    progress: 75,
    grade: "A-",
    assignments: [
      { name: "Binary Search Implementation", due: "Tomorrow", status: "pending" },
      { name: "Sorting Algorithms Analysis", due: "Next Week", status: "completed" },
    ],
    classmates: 45,
    color: "from-blue-500 to-purple-600",
  },
  {
    id: 2,
    code: "CS 202",
    name: "Mobile App Development",
    professor: "Prof. Michael Rodriguez",
    credits: 4,
    schedule: "TTh 2:00-4:00 PM",
    location: "Computer Lab 305",
    progress: 90,
    grade: "A",
    assignments: [
      { name: "Final Project Presentation", due: "Friday", status: "pending" },
      { name: "UI/UX Design Portfolio", due: "Completed", status: "completed" },
    ],
    classmates: 32,
    color: "from-green-500 to-blue-600",
  },
  {
    id: 3,
    code: "MATH 301",
    name: "Discrete Mathematics",
    professor: "Dr. Emily Watson",
    credits: 3,
    schedule: "MWF 1:00-2:00 PM",
    location: "Math Building 150",
    progress: 60,
    grade: "B+",
    assignments: [
      { name: "Graph Theory Problem Set", due: "Monday", status: "pending" },
      { name: "Logic Proofs Assignment", due: "Next Friday", status: "not_started" },
    ],
    classmates: 28,
    color: "from-purple-500 to-pink-600",
  },
  {
    id: 4,
    code: "ENG 105",
    name: "Technical Writing",
    professor: "Prof. David Kim",
    credits: 2,
    schedule: "T 6:00-8:00 PM",
    location: "Liberal Arts 220",
    progress: 85,
    grade: "A",
    assignments: [{ name: "Research Paper Draft", due: "Wednesday", status: "pending" }],
    classmates: 20,
    color: "from-orange-500 to-red-600",
  },
]

const upcomingAssignments = courses.flatMap((course) =>
  course.assignments
    .filter((assignment) => assignment.status === "pending")
    .map((assignment) => ({
      ...assignment,
      course: course.code,
      courseName: course.name,
    })),
)

export default function CoursesPage() {
  const [selectedCourse, setSelectedCourse] = useState(courses[0])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500"
      case "pending":
        return "bg-yellow-500"
      case "not_started":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <SidebarInset>
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="md:hidden" />
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                My Courses 📚
              </h1>
              <p className="text-sm text-muted-foreground hidden md:block">
                Track your academic progress and stay organized
              </p>
            </div>
          </div>
          <Button className="bg-gradient-to-r from-blue-500 to-purple-600">
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Course
          </Button>
        </header>

        <div className="container mx-auto px-4 py-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="assignments">Assignments</TabsTrigger>
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
              <TabsTrigger value="grades">Grades</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className={`h-2 bg-gradient-to-r ${course.color}`}></div>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary">{course.code}</Badge>
                        <Badge className={getStatusColor("completed")}>{course.grade}</Badge>
                      </div>
                      <CardTitle className="text-lg">{course.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{course.professor}</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{course.progress}%</span>
                        </div>
                        <Progress value={course.progress} className="h-2" />
                      </div>

                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <ClockIcon className="h-4 w-4" />
                          <span>{course.schedule}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <BookOpenIcon className="h-4 w-4" />
                          <span>{course.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <UsersIcon className="h-4 w-4" />
                          <span>{course.classmates} classmates</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <GraduationCapIcon className="h-4 w-4" />
                          <span>{course.credits} credits</span>
                        </div>
                      </div>

                      <Button variant="outline" className="w-full" onClick={() => setSelectedCourse(course)}>
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="assignments" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CalendarIcon className="h-5 w-5" />
                      Upcoming Assignments
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {upcomingAssignments.map((assignment, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{assignment.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {assignment.course} • Due {assignment.due}
                          </p>
                        </div>
                        <Badge className={getStatusColor(assignment.status)}>
                          {assignment.status === "pending" ? "⏰ Pending" : "✅ Done"}
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Course Details: {selectedCourse.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium">All Assignments</h4>
                        <div className="mt-2 space-y-2">
                          {selectedCourse.assignments.map((assignment, index) => (
                            <div key={index} className="flex items-center justify-between p-2 border rounded">
                              <span className="text-sm">{assignment.name}</span>
                              <Badge className={getStatusColor(assignment.status)} variant="outline">
                                {assignment.status === "completed"
                                  ? "✅"
                                  : assignment.status === "pending"
                                    ? "⏰"
                                    : "❌"}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="schedule" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day) => (
                      <div key={day} className="space-y-2">
                        <h3 className="font-semibold text-center">{day}</h3>
                        <div className="space-y-2">
                          {courses
                            .filter((course) => {
                              const schedule = course.schedule.toLowerCase()
                              return (
                                (day === "Monday" && schedule.includes("m")) ||
                                (day === "Tuesday" && schedule.includes("t") && !schedule.includes("th")) ||
                                (day === "Wednesday" && schedule.includes("w")) ||
                                (day === "Thursday" && schedule.includes("th")) ||
                                (day === "Friday" && schedule.includes("f"))
                              )
                            })
                            .map((course) => (
                              <div
                                key={course.id}
                                className={`p-3 rounded-lg text-white text-sm bg-gradient-to-r ${course.color}`}
                              >
                                <div className="font-medium">{course.code}</div>
                                <div className="text-xs opacity-90">{course.schedule.split(" ")[1]}</div>
                              </div>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="grades" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Current Semester GPA</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                        3.75
                      </div>
                      <p className="text-muted-foreground">Out of 4.0</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Grade Distribution</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {courses.map((course) => (
                      <div key={course.id} className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">{course.code}</span>
                          <span className="text-sm text-muted-foreground ml-2">({course.credits} credits)</span>
                        </div>
                        <Badge
                          className={
                            course.grade.startsWith("A")
                              ? "bg-green-500"
                              : course.grade.startsWith("B")
                                ? "bg-blue-500"
                                : "bg-yellow-500"
                          }
                        >
                          {course.grade}
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </SidebarInset>
  )
}
