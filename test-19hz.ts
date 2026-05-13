import * as cheerio from 'cheerio';

async function test19hz() {
  try {
    const response = await fetch('https://19hz.info/eventlisting_BayArea.php', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SFEventBot/1.0)',
      },
    });

    console.log('Status:', response.status);

    const html = await response.text();
    console.log('HTML length:', html.length);

    const $ = cheerio.load(html);

    console.log('\n=== Looking for tables ===');
    const tables = $('table');
    console.log('Tables found:', tables.length);

    console.log('\n=== Looking for rows ===');
    const rows = $('table tr');
    console.log('Rows found:', rows.length);

    console.log('\n=== First 5 rows ===');
    rows.slice(0, 5).each((i, row) => {
      const cells = $(row).find('td');
      console.log(`Row ${i}: ${cells.length} cells`);
      if (cells.length > 0) {
        console.log(`  Date: ${$(cells[0]).text().trim()}`);
        console.log(`  Event: ${$(cells[1]).text().trim().substring(0, 50)}`);
      }
    });
  } catch (error) {
    console.error('Error:', error);
  }
}

test19hz();
