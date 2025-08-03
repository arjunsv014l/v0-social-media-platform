"use client"

import { Loader2 } from "lucide-react"

interface LoadingScreenProps {
  message?: string
  size?: "sm" | "md" | "lg"
}

export function LoadingScreen({ message = "Loading...", size = "md" }: LoadingScreenProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  }

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <Loader2 className={`${sizeClasses[size]} animate-spin text-primary mx-auto`} />
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  )
}

export function LoadingSpinner({ size = "md", className = "" }: { size?: "sm" | "md" | "lg"; className?: string }) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  }

  return <Loader2 className={`${sizeClasses[size]} animate-spin ${className}`} />
}
