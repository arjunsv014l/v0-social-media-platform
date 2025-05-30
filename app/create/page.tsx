"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { VideoUpload } from "@/components/video-upload"
import { VideoEditor } from "@/components/video-editor"
import { ContentTemplates } from "@/components/content-templates"
import { useAuth } from "@/contexts/auth-context"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

export default function CreatePage() {
  const { user, profile } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("upload")

  if (!user || !profile) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Content Studio</h1>
        <p className="text-muted-foreground">Create, edit, and share your content with the campus community</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">Upload Video</TabsTrigger>
          <TabsTrigger value="edit">Edit Video</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload Video</CardTitle>
              <CardDescription>Upload your video content to share with the campus community</CardDescription>
            </CardHeader>
            <CardContent>
              <VideoUpload />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="edit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Edit Video</CardTitle>
              <CardDescription>Edit your uploaded videos with our simple editing tools</CardDescription>
            </CardHeader>
            <CardContent>
              <VideoEditor />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Templates</CardTitle>
              <CardDescription>Choose from pre-designed templates for common student content</CardDescription>
            </CardHeader>
            <CardContent>
              <ContentTemplates />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
