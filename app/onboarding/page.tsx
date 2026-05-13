'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function OnboardingPage() {
  const [preferences, setPreferences] = useState('')
  const router = useRouter()

  const handleSave = () => {
    if (preferences.trim()) {
      localStorage.setItem('sf-events-prefs', preferences)
      router.push('/')
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 text-foreground">
            SF for you
          </h1>
          <p className="text-muted-foreground text-lg">
            Let's personalize your event feed
          </p>
        </div>

        <div className="bg-card rounded-lg p-8 border border-border">
          <label
            htmlFor="preferences"
            className="block text-lg font-medium mb-4 text-foreground"
          >
            What are you into?
          </label>
          <p className="text-sm text-muted-foreground mb-4">
            live music, AI meetups, free food, anything
          </p>

          <textarea
            id="preferences"
            value={preferences}
            onChange={(e) => setPreferences(e.target.value)}
            placeholder="I'm interested in..."
            className="w-full h-40 p-4 bg-background border border-border rounded-lg
                     text-foreground placeholder:text-muted-foreground
                     focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />

          <button
            onClick={handleSave}
            disabled={!preferences.trim()}
            className="mt-6 w-full bg-primary text-primary-foreground
                     py-3 px-6 rounded-lg font-medium hover:opacity-90 transition-opacity
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
