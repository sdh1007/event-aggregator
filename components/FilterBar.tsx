'use client'

interface FilterBarProps {
  dateFilter: 'today' | 'week' | 'month' | null
  onDateFilterChange: (filter: 'today' | 'week' | 'month' | null) => void
  sources: string[]
  selectedSources: string[]
  onSourceToggle: (source: string) => void
  onResetPreferences: () => void
}

export default function FilterBar({
  dateFilter,
  onDateFilterChange,
  sources,
  selectedSources,
  onSourceToggle,
  onResetPreferences,
}: FilterBarProps) {
  const dateFilters = [
    { value: 'today' as const, label: 'Today' },
    { value: 'week' as const, label: 'This Week' },
    { value: 'month' as const, label: 'This Month' },
  ]

  return (
    <div className="bg-card border border-border rounded-lg p-4 mb-6">
      <div className="flex flex-col gap-4">
        {/* Date filters */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            When
          </h3>
          <div className="flex flex-wrap gap-2">
            {dateFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() =>
                  onDateFilterChange(
                    dateFilter === filter.value ? null : filter.value
                  )
                }
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors
                  ${
                    dateFilter === filter.value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Source toggles */}
        {sources.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              Sources
            </h3>
            <div className="flex flex-wrap gap-2">
              {sources.map((source) => (
                <button
                  key={source}
                  onClick={() => onSourceToggle(source)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors
                    ${
                      selectedSources.includes(source)
                        ? 'bg-primary/20 text-primary border border-primary'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                >
                  {source}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Reset preferences */}
        <div className="pt-2 border-t border-border">
          <button
            onClick={onResetPreferences}
            className="text-sm text-muted-foreground hover:text-primary
                     hover:underline transition-colors"
          >
            Reset preferences
          </button>
        </div>
      </div>
    </div>
  )
}
