"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase/client"
import { useAuth } from "@/contexts/auth-context"
import { Scissors, Save, Loader2, Play, Pause, RotateCcw, Crop, Type, PenLine } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface VideoContent {
  id: string
  title: string
  file_url: string
  thumbnail_url: string | null
}

export function VideoEditor() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [userVideos, setUserVideos] = useState<VideoContent[]>([])
  const [selectedVideo, setSelectedVideo] = useState<VideoContent | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [startTrim, setStartTrim] = useState(0)
  const [endTrim, setEndTrim] = useState(0)
  const [activeTab, setActiveTab] = useState("trim")

  // Fetch user's videos
  useEffect(() => {
    const fetchVideos = async () => {
      if (!user) return

      try {
        const { data, error } = await supabase
          .from("content")
          .select("id, title, file_url, thumbnail_url")
          .eq("user_id", user.id)
          .eq("content_type", "video")
          .order("created_at", { ascending: false })

        if (error) throw error

        setUserVideos(data || [])
      } catch (error) {
        console.error("Error fetching videos:", error)
        toast({
          title: "Error",
          description: "Failed to load your videos",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchVideos()
  }, [user, toast])

  // Handle video selection
  const handleVideoSelect = (videoId: string) => {
    const video = userVideos.find((v) => v.id === videoId)
    if (video) {
      setSelectedVideo(video)
      setStartTrim(0)
      setEndTrim(0)
      setCurrentTime(0)
      setDuration(0)
    }
  }

  // Handle video element load
  const handleVideoLoad = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget
    setVideoElement(video)
    setDuration(video.duration)
    setEndTrim(video.duration)
  }

  // Handle video time update
  const handleTimeUpdate = () => {
    if (videoElement) {
      setCurrentTime(videoElement.currentTime)

      // Stop at end trim point
      if (videoElement.currentTime >= endTrim) {
        videoElement.pause()
        setIsPlaying(false)
        videoElement.currentTime = startTrim
      }
    }
  }

  // Play/pause video
  const togglePlay = () => {
    if (!videoElement) return

    if (isPlaying) {
      videoElement.pause()
    } else {
      // If at the end, restart from trim start
      if (videoElement.currentTime >= endTrim) {
        videoElement.currentTime = startTrim
      }
      videoElement.play()
    }

    setIsPlaying(!isPlaying)
  }

  // Reset video to start trim point
  const resetVideo = () => {
    if (!videoElement) return
    videoElement.currentTime = startTrim
    setCurrentTime(startTrim)
  }

  // Format time (seconds to MM:SS)
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  // Handle trim changes
  const handleTrimChange = (values: number[]) => {
    setStartTrim(values[0])
    setEndTrim(values[1])

    if (videoElement && videoElement.currentTime < values[0]) {
      videoElement.currentTime = values[0]
      setCurrentTime(values[0])
    } else if (videoElement && videoElement.currentTime > values[1]) {
      videoElement.currentTime = values[0]
      setCurrentTime(values[0])
    }
  }

  // Save edited video (this is a simplified version - in a real app, you'd send to a server for processing)
  const handleSaveEdit = async () => {
    if (!selectedVideo) return

    setIsSaving(true)

    // In a real app, you would send the trim points to a server-side function
    // that would process the video and return a new URL
    // For this demo, we'll just simulate a delay and show a success message

    try {
      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast({
        title: "Edit saved",
        description: "Your video has been edited successfully",
      })

      // In a real app, you would update the video URL in the database
    } catch (error) {
      console.error("Error saving edit:", error)
      toast({
        title: "Error",
        description: "Failed to save your edits",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-[300px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (userVideos.length === 0) {
    return (
      <div className="flex h-[300px] flex-col items-center justify-center text-center">
        <p className="mb-4 text-muted-foreground">You haven't uploaded any videos yet</p>
        <Button variant="outline" onClick={() => (window.location.href = "/create?tab=upload")}>
          Upload a video first
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Video Selection */}
      <div className="space-y-2">
        <Label htmlFor="video-select">Select a video to edit</Label>
        <Select value={selectedVideo?.id || ""} onValueChange={handleVideoSelect}>
          <SelectTrigger id="video-select">
            <SelectValue placeholder="Select a video" />
          </SelectTrigger>
          <SelectContent>
            {userVideos.map((video) => (
              <SelectItem key={video.id} value={video.id}>
                {video.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Video Preview */}
      {selectedVideo ? (
        <div className="space-y-4">
          <div className="relative rounded-lg overflow-hidden bg-black">
            <video
              src={selectedVideo.file_url}
              className="w-full h-[300px] object-contain"
              onLoadedMetadata={handleVideoLoad}
              onTimeUpdate={handleTimeUpdate}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />

            {/* Video Controls */}
            <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2 flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:text-white hover:bg-white/20"
                onClick={togglePlay}
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:text-white hover:bg-white/20"
                onClick={resetVideo}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>

              <div className="text-xs text-white">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>

              <div className="flex-1">
                <Slider
                  value={[currentTime]}
                  min={0}
                  max={duration}
                  step={0.01}
                  onValueChange={(values) => {
                    if (videoElement) {
                      videoElement.currentTime = values[0]
                      setCurrentTime(values[0])
                    }
                  }}
                  className="cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Editing Tools */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="trim">
                <Scissors className="h-4 w-4 mr-2" />
                Trim
              </TabsTrigger>
              <TabsTrigger value="crop">
                <Crop className="h-4 w-4 mr-2" />
                Crop
              </TabsTrigger>
              <TabsTrigger value="text">
                <Type className="h-4 w-4 mr-2" />
                Text
              </TabsTrigger>
              <TabsTrigger value="draw">
                <PenLine className="h-4 w-4 mr-2" />
                Draw
              </TabsTrigger>
            </TabsList>

            <TabsContent value="trim" className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Start: {formatTime(startTrim)}</span>
                        <span className="text-sm">End: {formatTime(endTrim)}</span>
                      </div>
                      <Slider
                        value={[startTrim, endTrim]}
                        min={0}
                        max={duration}
                        step={0.01}
                        onValueChange={handleTrimChange}
                      />
                    </div>

                    <div className="flex justify-between">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (videoElement) {
                            videoElement.currentTime = startTrim
                            setCurrentTime(startTrim)
                          }
                        }}
                      >
                        Set to Start
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (videoElement) {
                            videoElement.currentTime = endTrim
                            setCurrentTime(endTrim)
                          }
                        }}
                      >
                        Set to End
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="crop" className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center justify-center h-[100px]">
                    <p className="text-muted-foreground">Crop functionality would be implemented here</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="text" className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center justify-center h-[100px]">
                    <p className="text-muted-foreground">Text overlay functionality would be implemented here</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="draw" className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center justify-center h-[100px]">
                    <p className="text-muted-foreground">Drawing functionality would be implemented here</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Save Button */}
          <Button className="w-full" onClick={handleSaveEdit} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Edits
              </>
            )}
          </Button>
        </div>
      ) : (
        <div className="flex h-[300px] flex-col items-center justify-center text-center">
          <p className="text-muted-foreground">Select a video to start editing</p>
        </div>
      )}
    </div>
  )
}
