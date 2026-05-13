import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@/lib/kv';
import { Event } from '@/lib/types/event';

// Import all source fetchers
import { fetchFuncheap } from '@/lib/sources/funcheap';
import { fetchDoTheBay } from '@/lib/sources/dothebay';
import { fetch19hz } from '@/lib/sources/19hz';
import { fetchLuma } from '@/lib/sources/luma';

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  // Verify authorization
  const authHeader = request.headers.get('authorization');
  const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;

  if (authHeader !== expectedAuth) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Fetch from all sources in parallel
  const results = await Promise.allSettled([
    fetchFuncheap(),
    fetchDoTheBay(),
    fetch19hz(),
    fetchLuma(),
  ]);

  // Track counts by source
  const bySource: Record<string, number> = {
    funcheap: 0,
    dothebay: 0,
    '19hz': 0,
    luma: 0,
  };

  // Collect all successful results
  const allEvents: Event[] = [];
  const sourceNames = ['funcheap', 'dothebay', '19hz', 'luma'];

  results.forEach((result, index) => {
    const sourceName = sourceNames[index];
    if (result.status === 'fulfilled') {
      const events = result.value;
      bySource[sourceName] = events.length;
      allEvents.push(...events);
    } else {
      console.error(`Failed to fetch from ${sourceName}:`, result.reason);
      bySource[sourceName] = 0;
    }
  });

  // Deduplicate by url (keep first occurrence)
  const seenUrls = new Set<string>();
  const uniqueEvents = allEvents.filter((event) => {
    if (seenUrls.has(event.url)) {
      return false;
    }
    seenUrls.add(event.url);
    return true;
  });

  // Sort by startDate ascending
  uniqueEvents.sort((a, b) => {
    return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
  });

  // Write to KV with 24h TTL
  const ttl = 24 * 60 * 60; // 24 hours in seconds
  await kv.set('events:all', uniqueEvents, { ex: ttl });
  await kv.set('events:lastUpdated', new Date().toISOString());

  const durationMs = Date.now() - startTime;

  return NextResponse.json({
    count: uniqueEvents.length,
    bySource,
    durationMs,
  });
}
