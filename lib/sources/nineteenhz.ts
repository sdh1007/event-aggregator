import { createHash } from 'crypto';
import * as cheerio from 'cheerio';
import { Event } from '../types/event';

export async function fetch19hz(): Promise<Event[]> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch('https://19hz.info/eventlisting_BayArea.php', {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SFEventBot/1.0)',
      },
    });
    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const now = new Date();
    const sixtyDaysLater = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);

    const events: Event[] = [];

    $('table tr').each((_, row) => {
      const cells = $(row).find('td');
      if (cells.length < 5) return;

      const dateText = $(cells[0]).text().trim();
      const eventText = $(cells[1]).text().trim();
      const venueText = $(cells[2]).text().trim();
      const priceText = $(cells[3]).text().trim();
      const ticketsLink = $(cells[4]).find('a').attr('href');

      if (!eventText || !ticketsLink) return;

      const startDate = new Date(dateText);
      if (isNaN(startDate.getTime())) return;
      if (startDate < now || startDate > sixtyDaysLater) return;

      const id = createHash('sha1')
        .update('19hz' + ticketsLink)
        .digest('hex')
        .slice(0, 12);

      const description = `${eventText} at ${venueText}`.slice(0, 500);

      const tags = ['music', 'nightlife'];
      const eventLower = eventText.toLowerCase();
      if (eventLower.includes('techno')) tags.push('techno');
      if (eventLower.includes('house')) tags.push('house');
      if (eventLower.includes('trance')) tags.push('trance');
      if (eventLower.includes('dnb') || eventLower.includes('drum')) tags.push('dnb');

      events.push({
        id,
        title: eventText,
        description,
        startDate: startDate.toISOString(),
        location: venueText,
        url: ticketsLink,
        source: '19hz',
        tags,
      });
    });

    return events;
  } catch (error) {
    console.error('Error fetching 19hz events:', error);
    return [];
  }
}
