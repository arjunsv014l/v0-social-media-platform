export default function CreateLoading() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <div className="h-8 w-48 bg-muted rounded animate-pulse mb-2"></div>
        <div className="h-4 w-96 bg-muted rounded animate-pulse"></div>
      </div>

      <div className="h-[500px] bg-muted rounded animate-pulse"></div>
    </div>
  )
}
