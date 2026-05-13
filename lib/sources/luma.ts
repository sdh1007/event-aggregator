import { createHash } from 'crypto';
import type { Event } from '../types/event';

const PLACE_API_ID = 'discplace-BDj7GNbGlsF7Cka'; // San Francisco
const API_URL = `https://api2.luma.com/discover/get-paginated-events?discover_place_api_id=${PLACE_API_ID}&pagination_limit=100`;
const USER_AGENT = 'Mozilla/5.0 (compatible; SFEventBot/1.0)';

// Tag keyword mappings
const TAG_KEYWORDS: Record<string, string[]> = {
  ai: ['ai', 'artificial intelligence', 'machine learning', 'ml', 'llm', 'gpt', 'openai', 'chatgpt'],
  startup: ['startup', 'founder', 'entrepreneurship', 'pitch', 'venture', 'seed'],
  crypto: ['crypto', 'blockchain', 'web3', 'bitcoin', 'ethereum', 'defi', 'nft'],
  design: ['design', 'ux', 'ui', 'product design', 'figma'],
  founders: ['founder', 'ceo', 'entrepreneur', 'cofounder'],
  networking: ['networking', 'mixer', 'meetup', 'happy hour'],
  tech: ['tech', 'technology', 'software', 'engineering', 'developer'],
};

/**
 * Generate a unique ID hash for an event
 */
function generateEventId(url: string, title: string, startDate: string): string {
  const hashInput = `${url}-${title}-${startDate}`;
  return createHash('md5').update(hashInput).digest('hex').substring(0, 16);
}

/**
 * Derive tags from event title and description based on keyword matching
 */
function deriveTags(title: string, description: string): string[] {
  const text = `${title} ${description}`.toLowerCase();
  const tags: string[] = [];

  for (const [tag, keywords] of Object.entries(TAG_KEYWORDS)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      tags.push(tag);
    }
  }

  return tags.length > 0 ? tags : ['tech'];
}

/**
 * Parse events from Luma API response
 */
function parseApiResponse(data: any): Event[] {
  const events: Event[] = [];

  if (!data.entries || !Array.isArray(data.entries)) {
    return events;
  }

  for (const entry of data.entries) {
    try {
      const eventData = entry.event;
      if (!eventData) continue;

      const title = eventData.name || '';
      const startDate = entry.start_at || eventData.start_at || '';
      const url = eventData.url ? `https://lu.ma/${eventData.url}` : `https://lu.ma/e/${eventData.api_id}`;

      if (!title || !startDate) continue;

      // Build description from multiple sources
      const calendarDesc = entry.calendar?.description_short || '';
      const geoDesc = eventData.geo_address_info?.description || '';
      const description = geoDesc || calendarDesc || '';

      // Get location from geo_address_info
      const location =
        eventData.geo_address_info?.short_address ||
        eventData.geo_address_info?.city ||
        'San Francisco';

      const imageUrl = eventData.cover_url || eventData.social_image_url || undefined;
      const endDate = eventData.end_at || undefined;

      const event: Event = {
        id: generateEventId(url, title, startDate),
        title,
        description,
        startDate,
        endDate,
        location,
        url,
        imageUrl,
        tags: deriveTags(title, description),
        source: 'luma',
      };

      events.push(event);
    } catch (err) {
      console.error('Failed to parse event entry:', err);
    }
  }

  return events;
}

/**
 * Fetch and parse events from lu.ma/discover/sf
 * Returns empty array on failure (doesn't throw)
 */
export async function fetchLuma(): Promise<Event[]> {
  try {
    const response = await fetch(API_URL, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`Luma API fetch failed: ${response.status} ${response.statusText}`);
      return [];
    }

    const data = await response.json();
    const events = parseApiResponse(data);

    console.log(`Successfully fetched ${events.length} events from Luma`);
    return events;

  } catch (err) {
    console.error('Error fetching Luma events:', err);
    return [];
  }
}
