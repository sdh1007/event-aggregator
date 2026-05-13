import { fetchLuma } from './lib/sources/luma';

async function main() {
  console.log('Fetching SF tech/startup events from Luma...\n');

  const events = await fetchLuma();

  if (events.length === 0) {
    console.log('No events found or an error occurred.');
    return;
  }

  console.log(`\nFound ${events.length} events:\n`);

  events.forEach((event, index) => {
    console.log(`${index + 1}. ${event.title}`);
    console.log(`   Date: ${new Date(event.startDate).toLocaleString()}`);
    console.log(`   Location: ${event.location}`);
    console.log(`   Tags: ${event.tags.join(', ')}`);
    console.log(`   URL: ${event.url}`);
    console.log();
  });
}

main();
