"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { BellIcon, EyeIcon, LockIcon, PaletteIcon, UserIcon } from "lucide-react"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    posts: true,
    messages: true,
    events: false,
    courses: true,
    friends: true,
  })

  const [privacy, setPrivacy] = useState({
    profileVisibility: "friends",
    showEmail: false,
    showPhone: false,
    allowMessages: true,
  })

  const handleSave = () => {
    alert("Settings saved successfully! ✅")
  }

  return (
    <SidebarInset>
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="md:hidden" />
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Settings ⚙️
              </h1>
              <p className="text-sm text-muted-foreground hidden md:block">Customize your CampusConnect experience</p>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-6">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <UserIcon className="h-4 w-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <BellIcon className="h-4 w-4" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="privacy" className="flex items-center gap-2">
                <LockIcon className="h-4 w-4" />
                Privacy
              </TabsTrigger>
              <TabsTrigger value="appearance" className="flex items-center gap-2">
                <PaletteIcon className="h-4 w-4" />
                Appearance
              </TabsTrigger>
              <TabsTrigger value="account" className="flex items-center gap-2">
                <EyeIcon className="h-4 w-4" />
                Account
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Update your personal information and academic details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <img
                        src="/placeholder.svg?height=100&width=100&query=student profile"
                        alt="Profile"
                        className="h-24 w-24 rounded-full object-cover"
                      />
                      <Button size="sm" className="absolute bottom-0 right-0 rounded-full h-8 w-8 p-0">
                        ✏️
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold">Profile Photo</h3>
                      <p className="text-sm text-muted-foreground">
                        Upload a new profile picture to help others recognize you
                      </p>
                      <Button variant="outline" size="sm">
                        Change Photo
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" defaultValue="Michael" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" defaultValue="Turner" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      placeholder="Tell us about yourself..."
                      defaultValue="Computer Science student passionate about AI and web development. Always looking to collaborate on cool projects! 🚀"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="major">Major</Label>
                      <Select defaultValue="cs">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cs">Computer Science</SelectItem>
                          <SelectItem value="business">Business</SelectItem>
                          <SelectItem value="engineering">Engineering</SelectItem>
                          <SelectItem value="psychology">Psychology</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="year">Graduation Year</Label>
                      <Select defaultValue="2025">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2024">2024</SelectItem>
                          <SelectItem value="2025">2025</SelectItem>
                          <SelectItem value="2026">2026</SelectItem>
                          <SelectItem value="2027">2027</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button onClick={handleSave} className="bg-gradient-to-r from-blue-500 to-purple-600">
                    Save Changes
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>Choose what notifications you want to receive</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">New Posts</h4>
                        <p className="text-sm text-muted-foreground">Get notified when friends share new posts</p>
                      </div>
                      <Switch
                        checked={notifications.posts}
                        onCheckedChange={(checked) => setNotifications({ ...notifications, posts: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Messages</h4>
                        <p className="text-sm text-muted-foreground">Get notified about new direct messages</p>
                      </div>
                      <Switch
                        checked={notifications.messages}
                        onCheckedChange={(checked) => setNotifications({ ...notifications, messages: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Events</h4>
                        <p className="text-sm text-muted-foreground">Get notified about upcoming campus events</p>
                      </div>
                      <Switch
                        checked={notifications.events}
                        onCheckedChange={(checked) => setNotifications({ ...notifications, events: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Course Updates</h4>
                        <p className="text-sm text-muted-foreground">
                          Get notified about assignment deadlines and course announcements
                        </p>
                      </div>
                      <Switch
                        checked={notifications.courses}
                        onCheckedChange={(checked) => setNotifications({ ...notifications, courses: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Friend Requests</h4>
                        <p className="text-sm text-muted-foreground">
                          Get notified when someone sends you a friend request
                        </p>
                      </div>
                      <Switch
                        checked={notifications.friends}
                        onCheckedChange={(checked) => setNotifications({ ...notifications, friends: checked })}
                      />
                    </div>
                  </div>

                  <Button onClick={handleSave} className="bg-gradient-to-r from-green-500 to-blue-600">
                    Save Notification Settings
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="privacy" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Privacy Settings</CardTitle>
                  <CardDescription>Control who can see your information and contact you</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Profile Visibility</Label>
                      <Select
                        value={privacy.profileVisibility}
                        onValueChange={(value) => setPrivacy({ ...privacy, profileVisibility: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">Public - Anyone can see</SelectItem>
                          <SelectItem value="university">University - Only students from your university</SelectItem>
                          <SelectItem value="friends">Friends - Only your friends</SelectItem>
                          <SelectItem value="private">Private - Only you</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Show Email Address</h4>
                        <p className="text-sm text-muted-foreground">
                          Allow others to see your email address on your profile
                        </p>
                      </div>
                      <Switch
                        checked={privacy.showEmail}
                        onCheckedChange={(checked) => setPrivacy({ ...privacy, showEmail: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Show Phone Number</h4>
                        <p className="text-sm text-muted-foreground">
                          Allow others to see your phone number on your profile
                        </p>
                      </div>
                      <Switch
                        checked={privacy.showPhone}
                        onCheckedChange={(checked) => setPrivacy({ ...privacy, showPhone: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Allow Direct Messages</h4>
                        <p className="text-sm text-muted-foreground">Allow anyone to send you direct messages</p>
                      </div>
                      <Switch
                        checked={privacy.allowMessages}
                        onCheckedChange={(checked) => setPrivacy({ ...privacy, allowMessages: checked })}
                      />
                    </div>
                  </div>

                  <Button onClick={handleSave} className="bg-gradient-to-r from-purple-500 to-pink-600">
                    Save Privacy Settings
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="appearance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Appearance Settings</CardTitle>
                  <CardDescription>Customize how CampusConnect looks and feels</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Theme</Label>
                      <Select defaultValue="system">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">🌞 Light Mode</SelectItem>
                          <SelectItem value="dark">🌙 Dark Mode</SelectItem>
                          <SelectItem value="system">💻 System Default</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Accent Color</Label>
                      <div className="flex gap-3">
                        <div className="h-8 w-8 rounded-full bg-blue-500 cursor-pointer ring-2 ring-blue-500 ring-offset-2"></div>
                        <div className="h-8 w-8 rounded-full bg-purple-500 cursor-pointer hover:ring-2 hover:ring-purple-500 hover:ring-offset-2"></div>
                        <div className="h-8 w-8 rounded-full bg-green-500 cursor-pointer hover:ring-2 hover:ring-green-500 hover:ring-offset-2"></div>
                        <div className="h-8 w-8 rounded-full bg-pink-500 cursor-pointer hover:ring-2 hover:ring-pink-500 hover:ring-offset-2"></div>
                        <div className="h-8 w-8 rounded-full bg-orange-500 cursor-pointer hover:ring-2 hover:ring-orange-500 hover:ring-offset-2"></div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Font Size</Label>
                      <Select defaultValue="medium">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">Small</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="large">Large</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button onClick={handleSave} className="bg-gradient-to-r from-pink-500 to-orange-600">
                    Save Appearance Settings
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="account" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>Manage your account security and preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input id="email" type="email" defaultValue="michael.turner@university.edu" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" type="tel" defaultValue="+1 (555) 123-4567" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input id="currentPassword" type="password" placeholder="Enter current password" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input id="newPassword" type="password" placeholder="Enter new password" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input id="confirmPassword" type="password" placeholder="Confirm new password" />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button onClick={handleSave} className="bg-gradient-to-r from-blue-500 to-purple-600">
                      Update Account
                    </Button>
                    <Button variant="outline">Change Password</Button>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-red-600 mb-2">Danger Zone</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      These actions cannot be undone. Please be careful.
                    </p>
                    <div className="flex gap-4">
                      <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
                        Deactivate Account
                      </Button>
                      <Button variant="destructive">Delete Account</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </SidebarInset>
  )
}
