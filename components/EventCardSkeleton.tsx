export default function EventCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-lg p-6 animate-pulse">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="h-6 bg-muted rounded w-3/4"></div>
        <div className="h-6 bg-muted rounded w-20"></div>
      </div>

      <div className="flex flex-col gap-2 mb-3">
        <div className="h-4 bg-muted rounded w-1/2"></div>
      </div>

      <div className="bg-muted/30 rounded-md p-3 mb-3">
        <div className="h-4 bg-muted rounded w-full mb-2"></div>
        <div className="h-4 bg-muted rounded w-2/3"></div>
      </div>

      <div className="h-4 bg-muted rounded w-24"></div>
    </div>
  )
}
