"use client"

import type React from "react"
import { useState, useRef, type ChangeEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase/client"
import { useAuth } from "@/contexts/auth-context"
import { X, Upload, FileVideo, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

export function VideoUpload() {
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [isPublic, setIsPublic] = useState(true)
  const [tags, setTags] = useState<string[]>([])
  const [currentTag, setCurrentTag] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null)

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check if file is a video
    if (!file.type.startsWith("video/")) {
      toast({
        title: "Invalid file type",
        description: "Please select a video file",
        variant: "destructive",
      })
      return
    }

    // Check file size (limit to 100MB)
    if (file.size > 100 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select a video file smaller than 100MB",
        variant: "destructive",
      })
      return
    }

    setSelectedFile(file)

    // Create a preview URL
    const objectUrl = URL.createObjectURL(file)
    setVideoPreviewUrl(objectUrl)

    // Generate a thumbnail
    setTimeout(() => {
      const video = document.createElement("video")
      video.src = objectUrl
      video.addEventListener("loadeddata", () => {
        video.currentTime = 1 // Seek to 1 second
      })
      video.addEventListener("seeked", () => {
        const canvas = document.createElement("canvas")
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        const ctx = canvas.getContext("2d")
        ctx?.drawImage(video, 0, 0, canvas.width, canvas.height)
        const thumbnailDataUrl = canvas.toDataURL("image/jpeg")
        setThumbnailUrl(thumbnailDataUrl)
      })
    }, 500)
  }

  const handleAddTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()])
      setCurrentTag("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAddTag()
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !user) return

    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your video",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // 1. Upload video file to Supabase Storage
      const videoFileName = `${Date.now()}-${selectedFile.name.replace(/\s+/g, "-").toLowerCase()}`
      const videoFilePath = `${user.id}/${videoFileName}`

      const { data: videoData, error: videoError } = await supabase.storage
        .from("videos")
        .upload(videoFilePath, selectedFile, {
          cacheControl: "3600",
          upsert: false,
        })

      if (videoError) throw videoError

      // Simulate upload progress for demo
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i)
        await new Promise((resolve) => setTimeout(resolve, 100))
      }

      // 2. Get the public URL for the uploaded video
      const { data: videoUrl } = supabase.storage.from("videos").getPublicUrl(videoFilePath)

      // 3. Upload thumbnail if available
      let thumbnailPath = null
      if (thumbnailUrl && thumbnailUrl.startsWith("data:image")) {
        const thumbnailFileName = `${Date.now()}-thumbnail.jpg`
        const thumbnailFilePath = `${user.id}/${thumbnailFileName}`

        // Convert data URL to Blob
        const response = await fetch(thumbnailUrl)
        const blob = await response.blob()

        const { data: thumbnailData, error: thumbnailError } = await supabase.storage
          .from("videos")
          .upload(thumbnailFilePath, blob, {
            cacheControl: "3600",
            upsert: false,
            contentType: "image/jpeg",
          })

        if (!thumbnailError) {
          const { data: thumbUrl } = supabase.storage.from("videos").getPublicUrl(thumbnailFilePath)
          thumbnailPath = thumbUrl.publicUrl
        }
      }

      // 4. Create content record in database
      const { data: contentData, error: contentError } = await supabase
        .from("content")
        .insert({
          user_id: user.id,
          title,
          description,
          content_type: "video",
          file_url: videoUrl.publicUrl,
          thumbnail_url: thumbnailPath,
          tags,
          is_public: isPublic,
          file_size: selectedFile.size,
        })
        .select()

      if (contentError) throw contentError

      toast({
        title: "Upload successful",
        description: "Your video has been uploaded successfully",
      })

      // Reset form
      setTitle("")
      setDescription("")
      setTags([])
      setSelectedFile(null)
      setVideoPreviewUrl(null)
      setThumbnailUrl(null)
      setUploadProgress(0)

      // Redirect to profile to see the content
      router.push("/profile")
    } catch (error: any) {
      console.error("Upload error:", error)
      toast({
        title: "Upload failed",
        description: error.message || "There was an error uploading your video",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Video Preview */}
      {!videoPreviewUrl ? (
        <div
          className="flex h-[300px] cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="mb-3 h-10 w-10 text-gray-400" />
            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">MP4, WebM, or MOV (MAX. 100MB)</p>
          </div>
          <Input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </div>
      ) : (
        <div className="relative rounded-lg overflow-hidden">
          <video src={videoPreviewUrl} className="w-full h-[300px] object-contain bg-black" controls />
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={() => {
              setSelectedFile(null)
              setVideoPreviewUrl(null)
              setThumbnailUrl(null)
              if (fileInputRef.current) fileInputRef.current.value = ""
            }}
            disabled={isUploading}
          >
            <X className="h-4 w-4" />
          </Button>

          {thumbnailUrl && (
            <div className="absolute bottom-2 left-2 bg-black/50 rounded p-1">
              <p className="text-xs text-white">Thumbnail generated</p>
            </div>
          )}
        </div>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Uploading...</span>
            <span className="text-sm font-medium">{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}

      {/* Video Details Form */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            placeholder="Enter video title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isUploading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Describe your video"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isUploading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tags">Tags</Label>
          <div className="flex gap-2">
            <Input
              id="tags"
              placeholder="Add tags (press Enter)"
              value={currentTag}
              onChange={(e) => setCurrentTag(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isUploading}
            />
            <Button type="button" onClick={handleAddTag} disabled={!currentTag.trim() || isUploading}>
              Add
            </Button>
          </div>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="px-2 py-1">
                  {tag}
                  <X className="ml-1 h-3 w-3 cursor-pointer" onClick={() => handleRemoveTag(tag)} />
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Switch id="public" checked={isPublic} onCheckedChange={setIsPublic} disabled={isUploading} />
          <Label htmlFor="public">Make video public</Label>
        </div>

        <Button className="w-full" onClick={handleUpload} disabled={!selectedFile || isUploading}>
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <FileVideo className="mr-2 h-4 w-4" />
              Upload Video
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
