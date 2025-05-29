import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BellIcon, MessageSquareIcon, PlusIcon, SearchIcon } from "lucide-react"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import NewPostCard from "@/components/new-post-card"
import PostCard from "@/components/post-card"
import TrendingSidebar from "@/components/trending-sidebar"

export default function Home() {
  return (
    <SidebarInset>
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="md:hidden" />
          <div className="hidden md:block">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Home Feed 🏠
            </h1>
          </div>
        </div>
        <div className="relative hidden md:block">
          <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search posts, people, events..."
            className="h-9 w-64 rounded-full border border-input bg-background pl-8 pr-4 text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button size="icon" variant="ghost">
            <SearchIcon className="h-5 w-5 md:hidden" />
            <span className="sr-only">Search</span>
          </Button>
          <Button size="icon" variant="ghost" className="relative">
            <BellIcon className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
              3
            </span>
            <span className="sr-only">Notifications</span>
          </Button>
          <Link href="/messages">
            <Button size="icon" variant="ghost" className="relative">
              <MessageSquareIcon className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-blue-500 text-xs text-white flex items-center justify-center">
                2
              </span>
              <span className="sr-only">Messages</span>
            </Button>
          </Link>
          <Button size="icon" className="bg-gradient-to-r from-blue-500 to-purple-600 md:hidden">
            <PlusIcon className="h-5 w-5" />
            <span className="sr-only">New post</span>
          </Button>
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="outline" size="sm" className="hidden md:flex">
                Login
              </Button>
            </Link>
            <Link href="/profile">
              <Button size="sm" variant="ghost" className="relative h-9 w-9 rounded-full">
                <img
                  src="/placeholder.svg?height=36&width=36&query=student profile"
                  alt="Profile"
                  className="h-9 w-9 rounded-full object-cover"
                />
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 ring-1 ring-background" />
                <span className="sr-only">Profile</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <NewPostCard />
            <div className="space-y-4">
              <PostCard
                avatar="/placeholder.svg?height=40&width=40&query=student profile 1"
                name="Emma Johnson"
                handle="@emma_j"
                timestamp="2h ago"
                content="Just aced my final exam! 🎉 All those late night study sessions finally paid off. Anyone want to celebrate this weekend?"
                image="/placeholder.svg?height=400&width=600&query=students celebrating"
                likes="142"
                comments="28"
                shares="5"
              />
              <PostCard
                avatar="/placeholder.svg?height=40&width=40&query=student profile 2"
                name="Alex Chen"
                handle="@alexc"
                timestamp="4h ago"
                content="Looking for teammates for the upcoming hackathon next month. Need 2 more people who are into AI and backend development. DM if interested!"
                likes="56"
                comments="43"
                shares="12"
              />
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
            </div>
          </div>
          <div className="hidden lg:block">
            <TrendingSidebar />
          </div>
        </div>
      </main>
    </SidebarInset>
  )
}
