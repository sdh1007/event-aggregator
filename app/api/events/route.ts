import { NextResponse } from 'next/server';
import { kv } from '@/lib/kv';
import { Event } from '@/lib/types/event';

export async function GET() {
  // Read from KV
  const events = (await kv.get<Event[]>('events:all')) || [];
  const lastUpdated = await kv.get<string>('events:lastUpdated');

  return NextResponse.json(
    {
      events,
      lastUpdated: lastUpdated || null,
    },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=600',
      },
    }
  );
}
