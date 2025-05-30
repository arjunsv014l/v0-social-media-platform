"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import {
  Presentation,
  BookOpen,
  Video,
  FileQuestion,
  Lightbulb,
  Award,
  Megaphone,
  Briefcase,
  GraduationCap,
  Users,
  Sparkles,
} from "lucide-react"

interface Template {
  id: string
  title: string
  description: string
  icon: React.ElementType
  category: string
}

export function ContentTemplates() {
  const { toast } = useToast()
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const categories = [
    { id: "academic", name: "Academic" },
    { id: "social", name: "Social" },
    { id: "career", name: "Career" },
  ]

  const templates: Template[] = [
    {
      id: "lecture-recap",
      title: "Lecture Recap",
      description: "Summarize key points from a lecture for your classmates",
      icon: Presentation,
      category: "academic",
    },
    {
      id: "study-guide",
      title: "Study Guide",
      description: "Create a comprehensive study guide for an upcoming exam",
      icon: BookOpen,
      category: "academic",
    },
    {
      id: "tutorial",
      title: "Tutorial",
      description: "Create a step-by-step tutorial on a specific topic",
      icon: Video,
      category: "academic",
    },
    {
      id: "qa-session",
      title: "Q&A Session",
      description: "Record answers to common questions about a subject",
      icon: FileQuestion,
      category: "academic",
    },
    {
      id: "campus-event",
      title: "Campus Event",
      description: "Promote an upcoming campus event or activity",
      icon: Megaphone,
      category: "social",
    },
    {
      id: "club-spotlight",
      title: "Club Spotlight",
      description: "Showcase a student club or organization",
      icon: Users,
      category: "social",
    },
    {
      id: "campus-tour",
      title: "Campus Tour",
      description: "Give a tour of a specific campus location or facility",
      icon: GraduationCap,
      category: "social",
    },
    {
      id: "student-life",
      title: "Day in the Life",
      description: "Share what a typical day is like for you as a student",
      icon: Sparkles,
      category: "social",
    },
    {
      id: "internship-experience",
      title: "Internship Experience",
      description: "Share insights from your internship or work experience",
      icon: Briefcase,
      category: "career",
    },
    {
      id: "skill-showcase",
      title: "Skill Showcase",
      description: "Demonstrate a professional or technical skill",
      icon: Award,
      category: "career",
    },
    {
      id: "career-tips",
      title: "Career Tips",
      description: "Share advice for job hunting or career development",
      icon: Lightbulb,
      category: "career",
    },
  ]

  const filteredTemplates = selectedCategory
    ? templates.filter((template) => template.category === selectedCategory)
    : templates

  const handleSelectTemplate = (template: Template) => {
    toast({
      title: "Template selected",
      description: `You selected the ${template.title} template`,
    })

    // In a real app, this would navigate to a template-specific creation page
    // For now, we'll just redirect to the upload page
    router.push("/create?tab=upload")
  }

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === null ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedCategory(null)}
        >
          All
        </Button>
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category.id)}
          >
            {category.name}
          </Button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-primary/10 p-2">
                  <template.icon className="h-4 w-4 text-primary" />
                </div>
                <CardTitle className="text-base">{template.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pb-3">
              <CardDescription>{template.description}</CardDescription>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => handleSelectTemplate(template)}>
                Use Template
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
