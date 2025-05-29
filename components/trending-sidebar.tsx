import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function TrendingSidebar() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2 pt-4">
          <h3 className="font-semibold">Trending Topics</h3>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <ul className="space-y-2">
            <li>
              <Link href="#" className="block">
                <p className="text-sm font-medium">#FinalsWeek</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">1,245 posts</p>
              </Link>
            </li>
            <li>
              <Link href="#" className="block">
                <p className="text-sm font-medium">#SpringBreakPlans</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">872 posts</p>
              </Link>
            </li>
            <li>
              <Link href="#" className="block">
                <p className="text-sm font-medium">#CampusFood</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">631 posts</p>
              </Link>
            </li>
            <li>
              <Link href="#" className="block">
                <p className="text-sm font-medium">#StudyAbroad</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">524 posts</p>
              </Link>
            </li>
          </ul>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2 pt-4">
          <h3 className="font-semibold">Upcoming Events</h3>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <ul className="space-y-3">
            <li>
              <Link href="#" className="block">
                <p className="text-sm font-medium">Campus Career Fair</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Tomorrow, 10:00 AM - 3:00 PM</p>
              </Link>
            </li>
            <li>
              <Link href="#" className="block">
                <p className="text-sm font-medium">Student Club Showcase</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">This Friday, 5:00 PM</p>
              </Link>
            </li>
            <li>
              <Link href="#" className="block">
                <p className="text-sm font-medium">Computer Science Hackathon</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Next Weekend</p>
              </Link>
            </li>
          </ul>
          <Button variant="ghost" size="sm" className="mt-2 w-full text-sm">
            View all events
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2 pt-4">
          <h3 className="font-semibold">People You May Know</h3>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <ul className="space-y-3">
            <li className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img
                  src="/placeholder.svg?height=32&width=32&query=student profile 4"
                  alt="Profile"
                  className="h-8 w-8 rounded-full"
                />
                <div>
                  <p className="text-sm font-medium">Daniel Wilson</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Computer Science</p>
                </div>
              </div>
              <Button size="sm" variant="outline" className="h-8 text-xs">
                Follow
              </Button>
            </li>
            <li className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img
                  src="/placeholder.svg?height=32&width=32&query=student profile 5"
                  alt="Profile"
                  className="h-8 w-8 rounded-full"
                />
                <div>
                  <p className="text-sm font-medium">Jessica Lee</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Business Admin</p>
                </div>
              </div>
              <Button size="sm" variant="outline" className="h-8 text-xs">
                Follow
              </Button>
            </li>
            <li className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img
                  src="/placeholder.svg?height=32&width=32&query=student profile 6"
                  alt="Profile"
                  className="h-8 w-8 rounded-full"
                />
                <div>
                  <p className="text-sm font-medium">Ryan Park</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Engineering</p>
                </div>
              </div>
              <Button size="sm" variant="outline" className="h-8 text-xs">
                Follow
              </Button>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
