# SF Event Aggregator

Personalized event discovery for San Francisco tech and startup events.

## Features

- Aggregates events from multiple SF event sources (Luma, 19hz, Funcheap, DoTheBay)
- AI-powered event matching using Claude Haiku
- Personalized recommendations based on user preferences
- Automated event scraping via cron jobs

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **AI**: Anthropic Claude Haiku for event scoring
- **Database**: Vercel KV (Redis)
- **Scraping**: Cheerio, Puppeteer
- **Styling**: Tailwind CSS 4
- **Deployment**: Vercel

## Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   Create a `.env.local` file in the root directory:
   ```
   ANTHROPIC_API_KEY=your_anthropic_api_key_here
   KV_REST_API_URL=your_vercel_kv_url
   KV_REST_API_TOKEN=your_vercel_kv_token
   ```

3. **Run development server**:
   ```bash
   npm run dev
   ```

4. **Build for production**:
   ```bash
   npm run build
   ```

## Deployment to Vercel

### Prerequisites
- Vercel account
- Anthropic API key
- Vercel KV database

### Setup Steps

1. **Import project to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository

2. **Configure Environment Variables**:
   Add these in Vercel Dashboard → Settings → Environment Variables:

   - `ANTHROPIC_API_KEY` - Your Anthropic API key from [console.anthropic.com](https://console.anthropic.com)
   - `KV_REST_API_URL` - From your Vercel KV database
   - `KV_REST_API_TOKEN` - From your Vercel KV database

3. **Set up Vercel KV**:
   - In Vercel Dashboard → Storage → Create Database → KV
   - Copy the `KV_REST_API_URL` and `KV_REST_API_TOKEN`
   - Add them to your environment variables

4. **Deploy**:
   - Push to `main` branch
   - Vercel will automatically deploy

### Cron Jobs

The project includes a cron job that fetches events every 4 hours:
- Path: `/api/cron/fetch-events`
- Schedule: `0 */4 * * *` (every 4 hours)

This is configured in `vercel.json` and will run automatically on Vercel.

## API Endpoints

### `GET /api/events`
Returns all cached events from Vercel KV.

### `POST /api/match`
Scores events against user preferences using Claude Haiku.

**Request**:
```json
{
  "events": [...],
  "preferences": "I like AI, startups, and networking events"
}
```

**Response**:
```json
{
  "matches": [
    {
      "id": "...",
      "title": "...",
      "score": 85,
      "whyItMatches": "Matches your interest in AI and startups",
      ...
    }
  ]
}
```

### `GET /api/cron/fetch-events`
Scrapes events from all sources and updates the cache.

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── cron/fetch-events/   # Event scraping cron job
│   │   ├── events/              # Events API
│   │   └── match/               # AI matching API
│   ├── onboarding/              # User preferences setup
│   └── page.tsx                 # Main events feed
├── components/                  # React components
├── lib/
│   ├── sources/                 # Event source scrapers
│   ├── types/                   # TypeScript types
│   └── kv.ts                    # Vercel KV utilities
└── vercel.json                  # Vercel configuration
```

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Yes | API key for Claude Haiku |
| `KV_REST_API_URL` | Yes (production) | Vercel KV REST API URL |
| `KV_REST_API_TOKEN` | Yes (production) | Vercel KV REST API token |

## Troubleshooting

### Build fails on Vercel
- Ensure all environment variables are set
- Check that `ANTHROPIC_API_KEY` is valid
- Verify Vercel KV is properly connected

### Events not updating
- Check cron job logs in Vercel Dashboard
- Manually trigger `/api/cron/fetch-events`

### No events showing
- Verify KV database has data
- Check browser console for API errors
- Ensure preferences are set (visit `/onboarding`)

## License

MIT
