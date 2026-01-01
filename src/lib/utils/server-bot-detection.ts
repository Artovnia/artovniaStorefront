// Server-side bot detection utility - only for use in Server Components
import { headers } from 'next/headers'

/**
 * CONSERVATIVE BOT DETECTION STRATEGY
 * 
 * Philosophy: Only return true when DEFINITELY a bot
 * Never return true because something is missing or uncertain
 * 
 * This prevents false positives during:
 * - Vercel deployments (env propagation delays)
 * - Runtime cold starts (incomplete headers)
 * - Region failovers (header variations)
 * - Edge function warming (temporary state)
 */

// Known search engine and social media bots (SEO-critical)
const SEARCH_ENGINE_BOTS = [
  'googlebot',
  'bingbot',
  'slurp', // Yahoo
  'duckduckbot',
  'baiduspider',
  'yandexbot',
  'facebookexternalhit',
  'twitterbot',
  'linkedinbot',
  'applebot',
]

// Known monitoring and analytics bots
const MONITORING_BOTS = [
  'lighthouse',
  'pagespeed',
  'gtmetrix',
  'pingdom',
  'uptimerobot',
  'newrelic',
  'datadog',
]

// Known SEO and scraping bots
const SEO_SCRAPER_BOTS = [
  'semrushbot',
  'ahrefsbot',
  'mj12bot',
  'dotbot',
  'petalbot',
]

// Headless browsers (only obvious patterns)
const HEADLESS_PATTERNS = [
  'headlesschrome',
  'phantomjs',
  'selenium',
  'puppeteer',
  'playwright',
  'chrome-lighthouse',
]

// Simple command-line tools (definite bots)
const CLI_TOOLS = [
  'curl/',
  'wget/',
  'python-requests/',
  'node-fetch/',
  'axios/',
]

/**
 * PRODUCTION-SAFE BOT DETECTION
 * 
 * Server-side bot detection for use in Server Components only
 * 
 * CRITICAL DESIGN PRINCIPLES:
 * 1. Only return TRUE when DEFINITELY a bot (positive identification)
 * 2. NEVER return TRUE because something is missing/uncertain
 * 3. Default to FALSE (treat as human) when in doubt
 * 4. Deployment-safe: works during env propagation, cold starts, region failovers
 * 
 * IMPORTANT: This function can only be used in Server Components!
 * Do not import this in Client Components.
 */
export async function isServerSideBot(): Promise<boolean> {
  try {
    const headersList = await headers()
    const userAgent = headersList.get('user-agent')?.toLowerCase() || ''
    
    // ✅ STEP 1: Check for known search engine bots (SEO-critical)
    const isSearchEngineBot = SEARCH_ENGINE_BOTS.some(bot => 
      userAgent.includes(bot)
    )
    if (isSearchEngineBot) {
      return true
    }
    
    // ✅ STEP 2: Check for known monitoring/analytics bots
    const isMonitoringBot = MONITORING_BOTS.some(bot => 
      userAgent.includes(bot)
    )
    if (isMonitoringBot) {
      return true
    }
    
    // ✅ STEP 3: Check for known SEO/scraper bots
    const isScraperBot = SEO_SCRAPER_BOTS.some(bot => 
      userAgent.includes(bot)
    )
    if (isScraperBot) {
      return true
    }
    
    // ✅ STEP 4: Check for headless browsers (obvious patterns only)
    const isHeadless = HEADLESS_PATTERNS.some(pattern => 
      userAgent.includes(pattern)
    )
    if (isHeadless) {
      return true
    }
    
    // ✅ STEP 5: Check for command-line tools (definite bots)
    const isCLITool = CLI_TOOLS.some(tool => 
      userAgent.includes(tool)
    )
    if (isCLITool) {
      return true
    }
    
    // ✅ STEP 6: Check for explicit bot/crawler/spider in user agent
    // Only if combined with other indicators to avoid false positives
    if (userAgent.includes('bot') || userAgent.includes('crawler') || userAgent.includes('spider')) {
      // Additional validation: must not look like a browser
      const looksLikeBrowser = userAgent.includes('mozilla') || 
                               userAgent.includes('chrome') || 
                               userAgent.includes('safari') ||
                               userAgent.includes('firefox') ||
                               userAgent.includes('edge')
      
      if (!looksLikeBrowser) {
        return true
      }
    }
    
    // ❌ REMOVED: All aggressive heuristics that caused false positives:
    // - Missing/empty user agent checks
    // - Short user agent length checks
    // - Missing Accept/Accept-Language/Accept-Encoding headers
    // - Missing Sec-Fetch headers
    // - Cloud IP ranges (AWS, GCP, Azure, etc.)
    // - Cloud indicators in headers (aws, ec2, lambda, cloudfront)
    // - Vercel/Netlify deployment headers
    // - Referer pattern checks
    // - Proxy chain length checks
    // - Purpose: prefetch/prerender checks
    
    // 🎯 DEFAULT: Treat as human when uncertain
    return false
    
  } catch (error) {
    // ⚠️ CRITICAL: On error, default to FALSE (human)
    // Never block users because of detection errors
    console.error('Error in server-side bot detection:', error)
    return false
  }
}
