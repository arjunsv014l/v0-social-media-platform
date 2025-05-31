"use client"

import { Loader2, GraduationCap } from "lucide-react"

interface LoadingScreenProps {
  message?: string
  showLogo?: boolean
}

export default function LoadingScreen({ message = "Loading...", showLogo = true }: LoadingScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
      <div className="text-center space-y-4">
        {showLogo && (
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
        )}
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
        <p className="text-muted-foreground text-lg">{message}</p>
      </div>
    </div>
  )
}
