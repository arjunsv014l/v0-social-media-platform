import { Loader2 } from "lucide-react"

export default function CreateLoading() {
  return (
    <div className="flex h-[80vh] w-full items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading Content Studio...</p>
      </div>
    </div>
  )
}
