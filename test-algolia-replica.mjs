// Quick test: Query primary vs replica with category filter
// Run: node test-algolia-replica.mjs
// Uses the same env vars as the app

import { liteClient as algoliasearch } from 'algoliasearch/lite';

const ALGOLIA_ID = process.env.NEXT_PUBLIC_ALGOLIA_ID;
const ALGOLIA_SEARCH_KEY = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY;
const INDEX_NAME = process.env.NEXT_PUBLIC_ALGOLIA_PRODUCTS_INDEX || 'products';

if (!ALGOLIA_ID || !ALGOLIA_SEARCH_KEY) {
  console.error('Missing ALGOLIA_ID or ALGOLIA_SEARCH_KEY env vars');
  console.log('Run with: node --env-file=.env.local test-algolia-replica.mjs');
  process.exit(1);
}

const client = algoliasearch(ALGOLIA_ID, ALGOLIA_SEARCH_KEY);

// Use a real category ID from the product data you showed me
const CATEGORY_ID = 'pcat_01K19KGNHTMW7DT5MNXGW75HQT'; // "Zestawy prezentowe"
const PARENT_CATEGORY_ID = 'pcat_01K15Z3ZDH11G9YVRNM61WE5PQ'; // "Prezenty i okazje"

const indices = [
  INDEX_NAME,
  `${INDEX_NAME}_price_asc`,
  `${INDEX_NAME}_price_desc`,
  `${INDEX_NAME}_created_at_desc`,
  `${INDEX_NAME}_created_at_asc`,
];

const filters = [
  `categories.id:"${CATEGORY_ID}"`,
  `category_ids:"${CATEGORY_ID}"`,
  `(category_ids:"${CATEGORY_ID}" OR categories.id:"${CATEGORY_ID}")`,
  `(categories.id:"${CATEGORY_ID}" OR categories.id:"${PARENT_CATEGORY_ID}")`,
];

async function testQuery(indexName, filter) {
  try {
    const result = await client.search({
      requests: [{
        indexName,
        params: {
          filters: filter,
          hitsPerPage: 5,
          page: 0,
        }
      }]
    });
    const r = result.results[0];
    return { nbHits: r.nbHits, error: null };
  } catch (error) {
    return { nbHits: -1, error: error.message };
  }
}

console.log('=== Algolia Primary vs Replica Filter Test ===\n');
console.log(`Primary index: ${INDEX_NAME}`);
console.log(`Category: ${CATEGORY_ID}\n`);

for (const filter of filters) {
  console.log(`\nFilter: ${filter}`);
  console.log('-'.repeat(80));
  for (const idx of indices) {
    const result = await testQuery(idx, filter);
    const status = result.error ? `ERROR: ${result.error}` : `${result.nbHits} hits`;
    const label = idx === INDEX_NAME ? `${idx} (PRIMARY)` : idx;
    console.log(`  ${label.padEnd(45)} → ${status}`);
  }
}

// Also test with NO filter (should always work)
console.log(`\n\nFilter: (none)`);
console.log('-'.repeat(80));
for (const idx of indices) {
  const result = await testQuery(idx, '');
  const status = result.error ? `ERROR: ${result.error}` : `${result.nbHits} hits`;
  const label = idx === INDEX_NAME ? `${idx} (PRIMARY)` : idx;
  console.log(`  ${label.padEnd(45)} → ${status}`);
}
