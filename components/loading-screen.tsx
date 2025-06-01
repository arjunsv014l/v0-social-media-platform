import { Loader2 } from "lucide-react"

interface LoadingScreenProps {
  message?: string
  size?: "sm" | "md" | "lg"
  fullScreen?: boolean
}

export function LoadingScreen({ message = "Loading...", size = "md", fullScreen = false }: LoadingScreenProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  }

  const containerClasses = fullScreen
    ? "fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50"
    : "flex items-center justify-center py-8"

  return (
    <div className={containerClasses}>
      <div className="text-center">
        <Loader2 className={`${sizeClasses[size]} animate-spin text-primary mx-auto`} />
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  )
}

export function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  }

  return <Loader2 className={`${sizeClasses[size]} animate-spin`} />
}
