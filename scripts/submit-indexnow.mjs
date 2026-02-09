/**
 * Bulk submit all product URLs to IndexNow (Bing/Yandex)
 * 
 * Usage:
 *   node scripts/submit-indexnow.mjs
 * 
 * Required env vars (or edit the constants below):
 *   INDEXNOW_API_SECRET - the secret you set in Vercel
 *   NEXT_PUBLIC_BASE_URL - defaults to https://artovnia.com
 */

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://artovnia.com"
const API_SECRET = process.env.INDEXNOW_API_SECRET || ""
const BATCH_SIZE = 5000 // IndexNow accepts up to 10,000 per request

if (!API_SECRET) {
  console.error("❌ Set INDEXNOW_API_SECRET env var before running this script")
  console.error("   Example: $env:INDEXNOW_API_SECRET='your-secret'; node scripts/submit-indexnow.mjs")
  process.exit(1)
}

async function fetchSitemapUrls() {
  console.log(`📡 Fetching sitemap from ${BASE_URL}/sitemap.xml ...`)
  
  const response = await fetch(`${BASE_URL}/sitemap.xml`)
  if (!response.ok) {
    throw new Error(`Failed to fetch sitemap: ${response.status}`)
  }
  
  const xml = await response.text()
  
  // Extract all <loc> URLs from sitemap XML
  const urls = []
  const locRegex = /<loc>(.*?)<\/loc>/g
  let match
  while ((match = locRegex.exec(xml)) !== null) {
    urls.push(match[1])
  }
  
  return urls
}

async function submitBatch(urls, batchNumber, totalBatches) {
  console.log(`\n📤 Submitting batch ${batchNumber}/${totalBatches} (${urls.length} URLs)...`)
  
  const response = await fetch(`${BASE_URL}/api/indexnow`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_SECRET,
    },
    body: JSON.stringify({ urls }),
  })
  
  const result = await response.json()
  
  if (response.ok) {
    console.log(`✅ Batch ${batchNumber}: ${result.submitted} URLs submitted (status: ${result.status})`)
  } else {
    console.error(`❌ Batch ${batchNumber} failed:`, result)
  }
  
  return response.ok
}

async function main() {
  try {
    const urls = await fetchSitemapUrls()
    console.log(`\n📋 Found ${urls.length} URLs in sitemap`)
    
    // Show breakdown
    const products = urls.filter(u => u.includes("/products/"))
    const categories = urls.filter(u => u.includes("/categories/"))
    const sellers = urls.filter(u => u.includes("/sellers/"))
    const blog = urls.filter(u => u.includes("/blog/"))
    const other = urls.length - products.length - categories.length - sellers.length - blog.length
    
    console.log(`   - Products:   ${products.length}`)
    console.log(`   - Categories: ${categories.length}`)
    console.log(`   - Sellers:    ${sellers.length}`)
    console.log(`   - Blog:       ${blog.length}`)
    console.log(`   - Other:      ${other}`)
    
    // Submit in batches
    const totalBatches = Math.ceil(urls.length / BATCH_SIZE)
    let successCount = 0
    
    for (let i = 0; i < urls.length; i += BATCH_SIZE) {
      const batch = urls.slice(i, i + BATCH_SIZE)
      const batchNumber = Math.floor(i / BATCH_SIZE) + 1
      const success = await submitBatch(batch, batchNumber, totalBatches)
      if (success) successCount += batch.length
      
      // Small delay between batches to be polite
      if (i + BATCH_SIZE < urls.length) {
        await new Promise(r => setTimeout(r, 1000))
      }
    }
    
    console.log(`\n🎉 Done! Submitted ${successCount}/${urls.length} URLs to IndexNow`)
    console.log(`   Bing typically indexes within hours.`)
    
  } catch (error) {
    console.error("❌ Error:", error.message)
    process.exit(1)
  }
}

main()
