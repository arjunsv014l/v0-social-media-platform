"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import {
  GraduationCap,
  Users,
  Briefcase,
  BookOpen,
  Presentation,
  Calendar,
  Trophy,
  Code,
  Camera,
  Mic,
} from "lucide-react"

interface Template {
  id: string
  title: string
  description: string
  category: "academic" | "social" | "career"
  icon: React.ReactNode
  tags: string[]
  duration: string
}

const templates: Template[] = [
  // Academic Templates
  {
    id: "lecture-recap",
    title: "Lecture Recap",
    description: "Summarize key points from your latest lecture or class",
    category: "academic",
    icon: <BookOpen className="h-5 w-5" />,
    tags: ["education", "study", "notes"],
    duration: "5-10 min",
  },
  {
    id: "study-tutorial",
    title: "Study Tutorial",
    description: "Create a tutorial explaining a concept you've mastered",
    category: "academic",
    icon: <Presentation className="h-5 w-5" />,
    tags: ["tutorial", "teaching", "help"],
    duration: "10-15 min",
  },
  {
    id: "project-showcase",
    title: "Project Showcase",
    description: "Present your academic project or research findings",
    category: "academic",
    icon: <Trophy className="h-5 w-5" />,
    tags: ["project", "research", "showcase"],
    duration: "15-20 min",
  },
  {
    id: "coding-demo",
    title: "Coding Demo",
    description: "Demonstrate a programming concept or show your code",
    category: "academic",
    icon: <Code className="h-5 w-5" />,
    tags: ["programming", "code", "demo"],
    duration: "10-30 min",
  },

  // Social Templates
  {
    id: "campus-tour",
    title: "Campus Tour",
    description: "Show new students around your favorite campus spots",
    category: "social",
    icon: <Camera className="h-5 w-5" />,
    tags: ["campus", "tour", "freshman"],
    duration: "10-15 min",
  },
  {
    id: "event-recap",
    title: "Event Recap",
    description: "Share highlights from a campus event or activity",
    category: "social",
    icon: <Calendar className="h-5 w-5" />,
    tags: ["events", "campus life", "fun"],
    duration: "5-10 min",
  },
  {
    id: "student-life",
    title: "Day in My Life",
    description: "Show what a typical day looks like as a student",
    category: "social",
    icon: <Users className="h-5 w-5" />,
    tags: ["lifestyle", "daily", "student"],
    duration: "15-20 min",
  },
  {
    id: "club-promo",
    title: "Club Promotion",
    description: "Promote your student organization or club",
    category: "social",
    icon: <Mic className="h-5 w-5" />,
    tags: ["clubs", "organizations", "recruitment"],
    duration: "3-5 min",
  },

  // Career Templates
  {
    id: "internship-experience",
    title: "Internship Experience",
    description: "Share insights from your internship or work experience",
    category: "career",
    icon: <Briefcase className="h-5 w-5" />,
    tags: ["internship", "career", "experience"],
    duration: "10-15 min",
  },
  {
    id: "skill-showcase",
    title: "Skill Showcase",
    description: "Demonstrate a professional skill you've developed",
    category: "career",
    icon: <GraduationCap className="h-5 w-5" />,
    tags: ["skills", "professional", "portfolio"],
    duration: "5-10 min",
  },
  {
    id: "career-advice",
    title: "Career Advice",
    description: "Share career tips and advice for fellow students",
    category: "career",
    icon: <Users className="h-5 w-5" />,
    tags: ["advice", "career", "tips"],
    duration: "8-12 min",
  },
]

export function ContentTemplates() {
  const { toast } = useToast()
  const [selectedCategory, setSelectedCategory] = useState<"all" | "academic" | "social" | "career">("all")

  const filteredTemplates =
    selectedCategory === "all" ? templates : templates.filter((template) => template.category === selectedCategory)

  const handleUseTemplate = (template: Template) => {
    toast({
      title: "Template selected",
      description: `You've selected the "${template.title}" template. Start creating your content!`,
    })

    // In a real app, this would:
    // 1. Navigate to the upload tab
    // 2. Pre-fill some fields based on the template
    // 3. Provide template-specific guidance

    // For now, we'll just show a success message
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "academic":
        return <GraduationCap className="h-4 w-4" />
      case "social":
        return <Users className="h-4 w-4" />
      case "career":
        return <Briefcase className="h-4 w-4" />
      default:
        return null
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "academic":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "social":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "career":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <Tabs value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Templates</TabsTrigger>
          <TabsTrigger value="academic">
            <GraduationCap className="h-4 w-4 mr-2" />
            Academic
          </TabsTrigger>
          <TabsTrigger value="social">
            <Users className="h-4 w-4 mr-2" />
            Social
          </TabsTrigger>
          <TabsTrigger value="career">
            <Briefcase className="h-4 w-4 mr-2" />
            Career
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {template.icon}
                      <CardTitle className="text-lg">{template.title}</CardTitle>
                    </div>
                    <Badge className={getCategoryColor(template.category)}>
                      {getCategoryIcon(template.category)}
                      <span className="ml-1 capitalize">{template.category}</span>
                    </Badge>
                  </div>
                  <CardDescription className="text-sm">{template.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-1">
                      {template.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Duration: {template.duration}</span>
                      <Button size="sm" onClick={() => handleUseTemplate(template)} className="ml-auto">
                        Use Template
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No templates found for this category.</p>
        </div>
      )}
    </div>
  )
}
