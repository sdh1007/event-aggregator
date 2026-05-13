import { createHash } from 'crypto';
import Parser from 'rss-parser';
import { Event } from '../types/event';

export async function fetchDoTheBay(): Promise<Event[]> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const parser = new Parser({
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SFEventBot/1.0)',
      },
    });
    const feed = await parser.parseURL('https://dothebay.com/events.rss');
    clearTimeout(timeout);

    const now = new Date();
    const sixtyDaysLater = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);

    const events: Event[] = [];

    for (const item of feed.items) {
      if (!item.pubDate || !item.link) continue;

      const startDate = new Date(item.pubDate);
      if (isNaN(startDate.getTime())) continue;
      if (startDate < now || startDate > sixtyDaysLater) continue;

      const id = createHash('sha1')
        .update('dothebay' + item.link)
        .digest('hex')
        .slice(0, 12);

      const description = (item.contentSnippet || '')
        .replace(/<[^>]+>/g, '')
        .slice(0, 500);

      const tags = (item.categories || []).map(cat => cat.toLowerCase());

      events.push({
        id,
        title: item.title || 'Untitled Event',
        description,
        startDate: startDate.toISOString(),
        location: '',
        url: item.link,
        source: 'dothebay',
        tags,
        imageUrl: item.enclosure?.url,
      });
    }

    return events;
  } catch (error) {
    console.error('Error fetching DoTheBay events:', error);
    return [];
  }
}
