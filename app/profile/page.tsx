import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookmarkIcon, CalendarIcon, EditIcon, GraduationCapIcon, MapPinIcon, SettingsIcon } from "lucide-react"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import PostCard from "@/components/post-card"

export default function ProfilePage() {
  return (
    <SidebarInset>
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="md:hidden" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Profile 👤
            </h1>
          </div>
        </header>

        <div className="relative">
          <div className="h-48 w-full bg-blue-500 md:h-64">
            <img
              src="/placeholder.svg?height=250&width=1200&query=university campus"
              alt="Cover"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="container mx-auto px-4">
            <div className="relative -mt-16 flex flex-col items-center md:-mt-20 md:flex-row md:items-end md:space-x-5">
              <div className="h-32 w-32 overflow-hidden rounded-full border-4 border-background md:h-40 md:w-40">
                <img
                  src="/placeholder.svg?height=160&width=160&query=student profile portrait"
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="mt-4 flex flex-1 flex-col items-center space-y-4 md:mt-0 md:items-start md:justify-end md:space-y-0">
                <div className="flex flex-col items-center space-y-1 md:flex-row md:items-end md:space-x-4 md:space-y-0">
                  <h1 className="text-2xl font-bold">Michael Turner</h1>
                  <div className="flex space-x-1 text-sm text-muted-foreground">
                    <span>@michael_t</span>
                  </div>
                </div>
                <div className="mt-2 flex items-center space-x-2 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <GraduationCapIcon className="mr-1 h-4 w-4" />
                    <span>Computer Science</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center">
                    <CalendarIcon className="mr-1 h-4 w-4" />
                    <span>Class of 2025</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center">
                    <MapPinIcon className="mr-1 h-4 w-4" />
                    <span>Stanford University</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex space-x-2 md:mt-0">
                <Button size="sm">
                  <EditIcon className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
                <Button variant="outline" size="icon">
                  <SettingsIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="mt-8">
              <Tabs defaultValue="posts" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="posts">Posts</TabsTrigger>
                  <TabsTrigger value="media">Media</TabsTrigger>
                  <TabsTrigger value="academic">Academic</TabsTrigger>
                  <TabsTrigger value="saved">
                    <BookmarkIcon className="mr-2 h-4 w-4" />
                    Saved
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="posts" className="mt-6 space-y-4">
                  <PostCard
                    avatar="/placeholder.svg?height=40&width=40&query=student profile portrait"
                    name="Michael Turner"
                    handle="@michael_t"
                    timestamp="1d ago"
                    content="Does anyone have notes from yesterday's Algorithms class? I had to miss because of a doctor's appointment. Would really appreciate it! #CS101 #HelpNeeded"
                    likes="24"
                    comments="8"
                    shares="2"
                  />
                  <PostCard
                    avatar="/placeholder.svg?height=40&width=40&query=student profile portrait"
                    name="Michael Turner"
                    handle="@michael_t"
                    timestamp="3d ago"
                    content="Just finished my final project for Mobile App Development! Check out this UI I designed for a study planner app."
                    image="/placeholder.svg?height=400&width=600&query=mobile app ui study planner"
                    likes="78"
                    comments="15"
                    shares="7"
                  />
                  <PostCard
                    avatar="/placeholder.svg?height=40&width=40&query=student profile portrait"
                    name="Michael Turner"
                    handle="@michael_t"
                    timestamp="1w ago"
                    content="Looking for team members for the upcoming hackathon! I'm good with frontend development and UI/UX. Need someone who knows backend and database stuff. DM if interested!"
                    likes="42"
                    comments="23"
                    shares="5"
                  />
                </TabsContent>
                <TabsContent value="media" className="mt-6">
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                    <img
                      src="/placeholder.svg?height=200&width=200&query=student project"
                      alt="Media"
                      className="aspect-square w-full rounded-md object-cover"
                    />
                    <img
                      src="/placeholder.svg?height=200&width=200&query=campus event"
                      alt="Media"
                      className="aspect-square w-full rounded-md object-cover"
                    />
                    <img
                      src="/placeholder.svg?height=200&width=200&query=study group"
                      alt="Media"
                      className="aspect-square w-full rounded-md object-cover"
                    />
                    <img
                      src="/placeholder.svg?height=200&width=200&query=university presentation"
                      alt="Media"
                      className="aspect-square w-full rounded-md object-cover"
                    />
                    <img
                      src="/placeholder.svg?height=200&width=200&query=coding project"
                      alt="Media"
                      className="aspect-square w-full rounded-md object-cover"
                    />
                    <img
                      src="/placeholder.svg?height=200&width=200&query=student club"
                      alt="Media"
                      className="aspect-square w-full rounded-md object-cover"
                    />
                  </div>
                </TabsContent>
                <TabsContent value="academic" className="mt-6">
                  <div className="space-y-4">
                    <div className="rounded-lg border p-4">
                      <h3 className="text-lg font-semibold">Current Courses</h3>
                      <ul className="mt-3 space-y-2">
                        <li className="flex justify-between">
                          <span>CS 101: Introduction to Algorithms</span>
                          <span className="text-sm text-muted-foreground">A-</span>
                        </li>
                        <li className="flex justify-between">
                          <span>CS 202: Mobile App Development</span>
                          <span className="text-sm text-muted-foreground">A</span>
                        </li>
                        <li className="flex justify-between">
                          <span>MATH 301: Discrete Mathematics</span>
                          <span className="text-sm text-muted-foreground">B+</span>
                        </li>
                        <li className="flex justify-between">
                          <span>ENG 105: Technical Writing</span>
                          <span className="text-sm text-muted-foreground">A</span>
                        </li>
                      </ul>
                    </div>
                    <div className="rounded-lg border p-4">
                      <h3 className="text-lg font-semibold">Achievements</h3>
                      <ul className="mt-3 space-y-2">
                        <li className="flex items-center gap-2">
                          <div className="rounded-full bg-yellow-100 p-1 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                          </div>
                          <span>Dean's List - Fall 2023</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="rounded-full bg-blue-100 p-1 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <circle cx="12" cy="8" r="6" />
                              <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
                            </svg>
                          </div>
                          <span>1st Place - Campus Hackathon 2023</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="rounded-full bg-green-100 p-1 text-green-600 dark:bg-green-900 dark:text-green-300">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                              <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                              <path d="M4 22h16" />
                              <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                              <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                              <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
                            </svg>
                          </div>
                          <span>Programming Club Leader</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="saved" className="mt-6 space-y-4">
                  <PostCard
                    avatar="/placeholder.svg?height=40&width=40&query=student profile 3"
                    name="Sarah Williams"
                    handle="@sarahw"
                    timestamp="Yesterday"
                    content="The library now has extended hours during finals week. Open 24/7 starting Monday! #StudyTime #FinalsWeek"
                    image="/placeholder.svg?height=400&width=600&query=university library"
                    likes="89"
                    comments="17"
                    shares="32"
                  />
                  <PostCard
                    avatar="/placeholder.svg?height=40&width=40&query=student profile 7"
                    name="University Events"
                    handle="@uni_events"
                    timestamp="3d ago"
                    content="Reminder: Scholarship applications for next semester are due in two weeks! Visit the financial aid office or apply online through the student portal. #Scholarships #FinancialAid"
                    likes="156"
                    comments="42"
                    shares="78"
                  />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </SidebarInset>
  )
}
