interface EventCardProps {
  event: {
    title: string
    date: string
    time?: string
    venue?: string
    source: string
    price?: string
    url: string
    match_reason?: string
  }
}

export default function EventCard({ event }: EventCardProps) {
  const formatDateTime = (date: string, time?: string) => {
    const d = new Date(date)
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

    const dayName = days[d.getDay()]
    const month = months[d.getMonth()]
    const day = d.getDate()

    let timeStr = ''
    if (time) {
      timeStr = `, ${time}`
    }

    return `${dayName} ${month} ${day}${timeStr}`
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6
                    hover:border-primary transition-colors group">
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-lg font-semibold text-foreground flex-1 group-hover:text-primary transition-colors">
            {event.title}
          </h3>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                         bg-muted text-muted-foreground shrink-0">
            {event.source}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-muted-foreground">
          <span className="font-medium">{formatDateTime(event.date, event.time)}</span>
          {event.venue && (
            <>
              <span className="hidden sm:inline">•</span>
              <span>{event.venue}</span>
            </>
          )}
          {event.price && (
            <>
              <span className="hidden sm:inline">•</span>
              <span className="font-medium text-primary">{event.price}</span>
            </>
          )}
        </div>

        {event.match_reason && (
          <div className="bg-primary/10 border border-primary/20
                        rounded-md p-3 mt-1">
            <p className="text-sm text-foreground/90">
              <span className="font-medium">Why it matches:</span> {event.match_reason}
            </p>
          </div>
        )}

        <a
          href={event.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-sm font-medium text-primary
                   hover:underline mt-1"
        >
          View event
          <svg
            className="ml-1 w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </a>
      </div>
    </div>
  )
}
