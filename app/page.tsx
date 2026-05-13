'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import EventCard from '@/components/EventCard'
import EventCardSkeleton from '@/components/EventCardSkeleton'
import FilterBar from '@/components/FilterBar'

interface Event {
  title: string
  date: string
  time?: string
  venue?: string
  source: string
  price?: string
  url: string
  match_reason?: string
  score?: number
}

interface EventsMetadata {
  lastUpdated: string
}

export default function Home() {
  const router = useRouter()
  const [events, setEvents] = useState<Event[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [metadata, setMetadata] = useState<EventsMetadata | null>(null)
  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month' | null>(null)
  const [sources, setSources] = useState<string[]>([])
  const [selectedSources, setSelectedSources] = useState<string[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const prefs = localStorage.getItem('sf-events-prefs')
    if (!prefs) {
      router.push('/onboarding')
      return
    }

    loadEvents(prefs)
  }, [router, mounted])

  const loadEvents = async (preferences: string) => {
    setLoading(true)
    try {
      // Fetch events
      const eventsRes = await fetch('/api/events')
      const eventsData = await eventsRes.json()

      // Extract metadata if present
      if (eventsData.metadata) {
        setMetadata(eventsData.metadata)
      }

      const rawEvents = eventsData.events || eventsData

      // Match events with preferences
      const matchRes = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: rawEvents, preferences }),
      })

      if (!matchRes.ok) {
        console.error('Match API error:', matchRes.status, matchRes.statusText)
        throw new Error(`Match API failed: ${matchRes.status}`)
      }

      const matchData = await matchRes.json()
      const matchedEvents = matchData.matches || matchData

      setEvents(matchedEvents)
      setFilteredEvents(matchedEvents)

      // Extract unique sources
      const uniqueSources = Array.from(
        new Set(matchedEvents.map((e: Event) => e.source))
      ) as string[]
      setSources(uniqueSources)
      setSelectedSources(uniqueSources)
    } catch (error) {
      console.error('Error loading events:', error)
      setEvents([])
      setFilteredEvents([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let filtered = [...events]

    // Apply date filter
    if (dateFilter) {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

      filtered = filtered.filter((event) => {
        const dateStr = (event as any).startDate || (event as any).date
        if (!dateStr) return false

        const eventDate = new Date(dateStr)
        if (isNaN(eventDate.getTime())) return false

        const eventDay = new Date(
          eventDate.getFullYear(),
          eventDate.getMonth(),
          eventDate.getDate()
        )

        if (dateFilter === 'today') {
          return eventDay.getTime() === today.getTime()
        } else if (dateFilter === 'week') {
          const weekFromNow = new Date(today)
          weekFromNow.setDate(weekFromNow.getDate() + 7)
          return eventDay >= today && eventDay < weekFromNow
        } else if (dateFilter === 'month') {
          const monthFromNow = new Date(today)
          monthFromNow.setMonth(monthFromNow.getMonth() + 1)
          return eventDay >= today && eventDay < monthFromNow
        }
        return true
      })
    }

    // Apply source filter
    if (selectedSources.length > 0 && selectedSources.length < sources.length) {
      filtered = filtered.filter((event) => selectedSources.includes(event.source))
    }

    setFilteredEvents(filtered)
  }, [dateFilter, selectedSources, events, sources.length])

  const handleSourceToggle = (source: string) => {
    setSelectedSources((prev) =>
      prev.includes(source)
        ? prev.filter((s) => s !== source)
        : [...prev, source]
    )
  }

  const handleResetPreferences = () => {
    localStorage.removeItem('sf-events-prefs')
    router.push('/onboarding')
  }

  const formatLastUpdated = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  // Don't render anything until mounted (prevents localStorage access on server)
  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-foreground">
              SF for you
            </h1>
            {metadata?.lastUpdated && (
              <span className="text-sm text-muted-foreground">
                Updated {formatLastUpdated(metadata.lastUpdated)}
              </span>
            )}
          </div>
        </header>

        {/* Filters */}
        {!loading && events.length > 0 && (
          <FilterBar
            dateFilter={dateFilter}
            onDateFilterChange={setDateFilter}
            sources={sources}
            selectedSources={selectedSources}
            onSourceToggle={handleSourceToggle}
            onResetPreferences={handleResetPreferences}
          />
        )}

        {/* Loading state */}
        {loading && (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <EventCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && filteredEvents.length === 0 && (
          <div className="bg-card border border-border rounded-lg p-12 text-center">
            <div className="max-w-md mx-auto">
              <svg
                className="w-16 h-16 mx-auto mb-4 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <h3 className="text-xl font-semibold mb-2 text-foreground">
                No events found
              </h3>
              <p className="text-muted-foreground mb-4">
                {events.length === 0
                  ? "We couldn't find any events matching your preferences."
                  : "No events match your current filters."}
              </p>
              <button
                onClick={handleResetPreferences}
                className="text-primary hover:underline font-medium"
              >
                Edit preferences
              </button>
            </div>
          </div>
        )}

        {/* Events list */}
        {!loading && filteredEvents.length > 0 && (
          <div className="space-y-4">
            {filteredEvents.map((event, index) => (
              <EventCard key={`${event.url}-${index}`} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
