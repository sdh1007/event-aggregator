import { NextResponse } from 'next/server';
import { kv } from '@/lib/kv';
import { Event } from '@/lib/types/event';

export async function GET() {
  try {
    // Read from KV
    const events = (await kv.get<Event[]>('events:all')) || [];
    const lastUpdated = await kv.get<string>('events:lastUpdated');

    return NextResponse.json(
      {
        events,
        metadata: {
          lastUpdated: lastUpdated || new Date().toISOString(),
        },
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=600',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching events from KV:', error);
    // Return empty events array if KV is not configured
    return NextResponse.json(
      {
        events: [],
        metadata: {
          lastUpdated: new Date().toISOString(),
        },
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60',
        },
      }
    );
  }
}
