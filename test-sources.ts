import { fetchFuncheap } from './lib/sources/funcheap';
import { fetchDoTheBay } from './lib/sources/dothebay';
import { fetch19hz } from './lib/sources/nineteenhz';
import { fetchLuma } from './lib/sources/luma';

async function testSources() {
  console.log('Testing all sources...\n');

  console.log('1. Testing Funcheap...');
  const funcheap = await fetchFuncheap();
  console.log(`   ✓ Fetched ${funcheap.length} events\n`);

  console.log('2. Testing DoTheBay...');
  const dothebay = await fetchDoTheBay();
  console.log(`   ✓ Fetched ${dothebay.length} events\n`);

  console.log('3. Testing 19hz...');
  const hz19 = await fetch19hz();
  console.log(`   ✓ Fetched ${hz19.length} events\n`);

  console.log('4. Testing Luma...');
  const luma = await fetchLuma();
  console.log(`   ✓ Fetched ${luma.length} events\n`);

  console.log('=== TOTALS ===');
  console.log(`Funcheap: ${funcheap.length}`);
  console.log(`DoTheBay: ${dothebay.length}`);
  console.log(`19hz: ${hz19.length}`);
  console.log(`Luma: ${luma.length}`);
  console.log(`TOTAL: ${funcheap.length + dothebay.length + hz19.length + luma.length}`);
}

testSources();
