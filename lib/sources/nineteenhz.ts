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
      if (cells.length < 7) return;

      const dateText = $(cells[0]).text().trim();
      const eventCell = $(cells[1]);
      const eventText = eventCell.text().trim();
      const ticketsLink = eventCell.find('a').attr('href');
      const genreText = $(cells[2]).text().trim();
      const priceText = $(cells[3]).text().trim();

      if (!eventText || !ticketsLink) return;

      // Extract event name and venue from eventText
      // Format is usually: "Event Name @ Venue (City)"
      const atIndex = eventText.lastIndexOf(' @ ');
      const eventName = atIndex > 0 ? eventText.substring(0, atIndex).trim() : eventText;
      const venueText = atIndex > 0 ? eventText.substring(atIndex + 3).trim() : '';

      const startDate = new Date(dateText);
      if (isNaN(startDate.getTime())) return;
      if (startDate < now || startDate > sixtyDaysLater) return;

      const id = createHash('sha1')
        .update('19hz' + ticketsLink)
        .digest('hex')
        .slice(0, 12);

      const description = `${genreText}. ${priceText}`.slice(0, 500);

      const tags = ['music', 'nightlife'];
      const genreLower = `${genreText} ${eventName}`.toLowerCase();
      if (genreLower.includes('techno')) tags.push('techno');
      if (genreLower.includes('house')) tags.push('house');
      if (genreLower.includes('trance')) tags.push('trance');
      if (genreLower.includes('dnb') || genreLower.includes('drum')) tags.push('dnb');

      events.push({
        id,
        title: eventName,
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
