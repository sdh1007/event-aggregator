import { fetchLuma } from './lib/sources/luma';
import { fetchFuncheap } from './lib/sources/funcheap';
import { fetchDoTheBay } from './lib/sources/dothebay';
import { fetch19hz } from './lib/sources/nineteenhz';
import { kv } from './lib/kv';
import { Event } from './lib/types/event';

async function main() {
  console.log('Fetching SF tech/startup events from all sources...\n');

  // Fetch from all sources in parallel
  const results = await Promise.allSettled([
    fetchFuncheap(),
    fetchDoTheBay(),
    fetch19hz(),
    fetchLuma(),
  ]);

  const sourceNames = ['FunCheap', 'DoTheBay', '19hz', 'Luma'];
  const allEvents: Event[] = [];

  results.forEach((result, index) => {
    const sourceName = sourceNames[index];
    if (result.status === 'fulfilled') {
      const events = result.value;
      console.log(`✓ ${sourceName}: ${events.length} events`);

      // Tag each event with its source
      const taggedEvents = events.map((event) => ({
        ...event,
        source: sourceName.toLowerCase(),
      }));
      allEvents.push(...taggedEvents);
    } else {
      console.error(`✗ ${sourceName} failed:`, result.reason);
    }
  });

  if (allEvents.length === 0) {
    console.log('\nNo events found from any source.');
    return;
  }

  // Deduplicate by URL
  const seenUrls = new Set<string>();
  const uniqueEvents = allEvents.filter((event) => {
    if (seenUrls.has(event.url)) {
      return false;
    }
    seenUrls.add(event.url);
    return true;
  });

  // Sort by startDate
  uniqueEvents.sort((a, b) => {
    return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
  });

  console.log(`\n📊 Total: ${uniqueEvents.length} unique events (${allEvents.length} before dedup)\n`);

  // Save to KV
  try {
    const ttl = 24 * 60 * 60; // 24 hours
    await kv.set('events:all', uniqueEvents, { ex: ttl });
    await kv.set('events:lastUpdated', new Date().toISOString());
    console.log('✓ Events saved to KV store\n');
  } catch (error) {
    console.error('✗ Failed to save to KV:', error);
    console.log('\nShowing events anyway:\n');
  }

  // Show first 10 events
  console.log('First 10 events:');
  uniqueEvents.slice(0, 10).forEach((event, index) => {
    console.log(`\n${index + 1}. ${event.title}`);
    console.log(`   Date: ${new Date(event.startDate).toLocaleString()}`);
    console.log(`   Location: ${event.location}`);
    console.log(`   Source: ${event.source}`);
    console.log(`   Tags: ${event.tags.join(', ')}`);
    console.log(`   URL: ${event.url}`);
  });

  // Show source breakdown
  console.log('\n📈 Events by source:');
  const bySource = uniqueEvents.reduce((acc, event) => {
    acc[event.source] = (acc[event.source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  Object.entries(bySource).forEach(([source, count]) => {
    console.log(`   ${source}: ${count}`);
  });
}

main();
