import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { Event } from '@/lib/types/event';

interface MatchRequest {
  events: Event[];
  preferences: string;
}

interface EventScore {
  id: string;
  score: number;
  why: string;
}

interface MatchedEvent extends Event {
  score: number;
  whyItMatches: string;
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const MODEL = 'claude-haiku-4-5-20251001';
const BATCH_SIZE = 15;
const MAX_CONCURRENT_BATCHES = 4;

async function scoreBatch(
  events: Event[],
  preferences: string
): Promise<EventScore[]> {
  const strippedEvents = events.map((e) => ({
    id: e.id,
    title: e.title,
    description: e.description,
    tags: e.tags,
  }));

  const systemPrompt =
    'You score SF events 0-100 based on how well they match a user\'s stated interests. Output ONLY valid JSON.';

  const userPrompt = `User preferences: ${preferences}

Events to score:
${JSON.stringify(strippedEvents, null, 2)}

Return a JSON array of objects with this structure: [{"id": "...", "score": 0-100, "why": "one sentence under 20 words"}]

Output ONLY the JSON array, no other text.`;

  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 4096,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type');
    }

    const text = content.text.trim();
    const parsed = JSON.parse(text);

    if (!Array.isArray(parsed)) {
      throw new Error('Response is not an array');
    }

    return parsed.map((item) => ({
      id: item.id,
      score: typeof item.score === 'number' ? item.score : 50,
      why: typeof item.why === 'string' ? item.why : "couldn't analyze",
    }));
  } catch (error) {
    console.error('Error scoring batch:', error);
    return events.map((e) => ({
      id: e.id,
      score: 50,
      why: "couldn't analyze",
    }));
  }
}

function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

async function processBatchesConcurrently(
  batches: Event[][],
  preferences: string,
  maxConcurrent: number
): Promise<EventScore[]> {
  const results: EventScore[] = [];

  for (let i = 0; i < batches.length; i += maxConcurrent) {
    const batchGroup = batches.slice(i, i + maxConcurrent);
    const batchPromises = batchGroup.map((batch) =>
      scoreBatch(batch, preferences)
    );
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults.flat());
  }

  return results;
}

export async function POST(request: NextRequest) {
  try {
    const body: MatchRequest = await request.json();
    const { events, preferences } = body;

    if (!events || !Array.isArray(events)) {
      return NextResponse.json(
        { error: 'events must be an array' },
        { status: 400 }
      );
    }

    if (!preferences || typeof preferences !== 'string') {
      return NextResponse.json(
        { error: 'preferences must be a string' },
        { status: 400 }
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY not configured' },
        { status: 500 }
      );
    }

    const batches = chunkArray(events, BATCH_SIZE);
    const scores = await processBatchesConcurrently(
      batches,
      preferences,
      MAX_CONCURRENT_BATCHES
    );

    const scoreMap = new Map(scores.map((s) => [s.id, s]));

    const matchedEvents: MatchedEvent[] = events
      .map((event) => {
        const score = scoreMap.get(event.id);
        return {
          ...event,
          score: score?.score ?? 50,
          whyItMatches: score?.why ?? "couldn't analyze",
        };
      })
      .filter((event) => event.score >= 40)
      .sort((a, b) => b.score - a.score);

    return NextResponse.json({ matches: matchedEvents });
  } catch (error) {
    console.error('Error in /api/match:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
