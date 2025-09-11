// Server-side bot detection utility - only for use in Server Components
import { headers } from 'next/headers'

// Common bot user agents that should use database instead of Algolia
const BOT_USER_AGENTS = [
  'googlebot',
  'bingbot',
  'slurp', // Yahoo
  'duckduckbot',
  'baiduspider',
  'yandexbot',
  'facebookexternalhit',
  'twitterbot',
  'linkedinbot',
  'whatsapp',
  'telegram',
  'discordbot',
  'slackbot',
  'applebot',
  'crawler',
  'spider',
  'bot',
  'scraper',
  'lighthouse',
  'pagespeed',
  'gtmetrix',
  'pingdom',
  'uptimerobot',
  'semrushbot',
  'ahrefsbot',
  'mj12bot',
  'dotbot',
  'petalbot',
  // Amazon/AWS specific bots
  'amazonbot',
  'amazon',
  'aws',
  'ec2',
  'lambda',
  'cloudfront',
  'elastic',
  // Cloud hosting and monitoring bots
  'vercel',
  'netlify',
  'heroku',
  'digitalocean',
  'linode',
  'vultr',
  'newrelic',
  'datadog',
  'statuspage',
  'monitor',
  'check',
  'test',
  'preview',
  'staging',
  'build',
  'deploy',
  // Additional scrapers and crawlers
  'curl',
  'wget',
  'python-requests',
  'node-fetch',
  'axios',
  'http',
  'fetch',
  'scrape',
  'harvest',
  'extract',
]

// Additional patterns for headless browsers and automation tools
const HEADLESS_PATTERNS = [
  'headlesschrome',
  'phantomjs',
  'selenium',
  'puppeteer',
  'playwright',
  'webdriver',
  'automation',
  'chrome-lighthouse',
  'jsdom',
  'zombie',
  'nightmare',
]

// AWS/Cloud IP ranges that indicate automated traffic
// These are the major AWS IP ranges mentioned in the analysis
const AWS_IP_RANGES = [
  /^3\./,      // AWS EC2 us-east-1
  /^18\./,     // AWS EC2 us-east-1
  /^44\./,     // AWS EC2 public blocks
  /^54\./,     // AWS EC2 public blocks
  /^52\./,     // AWS EC2 additional ranges
  /^34\./,     // AWS EC2 additional ranges
  /^35\./,     // AWS EC2 additional ranges
  /^13\./,     // AWS EC2 additional ranges
  /^184\.72\./, // Specific AWS range from analysis
]

// Other cloud provider IP patterns
const CLOUD_IP_PATTERNS = [
  // Google Cloud
  /^35\.199\./,
  /^35\.235\./,
  /^104\.196\./,
  /^104\.197\./,
  /^104\.198\./,
  // Microsoft Azure
  /^40\./,
  /^52\./,
  /^13\.64\./,
  /^13\.65\./,
  // DigitalOcean
  /^104\.131\./,
  /^104\.236\./,
  /^138\.197\./,
  /^159\.203\./,
  // Linode
  /^139\.162\./,
  /^172\.104\./,
  /^173\.230\./,
  // Vultr
  /^45\.32\./,
  /^45\.63\./,
  /^104\.207\./,
]

/**
 * Server-side bot detection for use in Server Components only
 * More comprehensive than client-side detection
 * 
 * IMPORTANT: This function can only be used in Server Components!
 * Do not import this in Client Components.
 */
export async function isServerSideBot(): Promise<boolean> {
  try {
    const headersList = await headers()
    const userAgent = headersList.get('user-agent')?.toLowerCase() || ''
    
    // Check for empty or missing user agent (common for bots)
    if (!userAgent || userAgent.trim() === '') {
      return true
    }
    
    // Check against known bot user agents
    const isBotUserAgent = BOT_USER_AGENTS.some(botAgent => 
      userAgent.includes(botAgent)
    )
    
    if (isBotUserAgent) {
      return true
    }
    
    // Check for headless browser patterns
    const isHeadless = HEADLESS_PATTERNS.some(pattern => 
      userAgent.includes(pattern)
    )
    
    if (isHeadless) {
      return true
    }
    
    // CRITICAL: Check for AWS/Cloud server IPs
    const clientIP = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                    headersList.get('x-real-ip') || 
                    headersList.get('cf-connecting-ip') || // Cloudflare
                    headersList.get('x-client-ip') ||
                    ''
    
    if (clientIP) {
      // Check AWS IP ranges (major source of bot traffic)
      const isAWSIP = AWS_IP_RANGES.some(pattern => pattern.test(clientIP))
      if (isAWSIP) {
        return true
      }
      
      // Check other cloud provider IPs
      const isCloudIP = CLOUD_IP_PATTERNS.some(pattern => pattern.test(clientIP))
      if (isCloudIP) {
        return true
      }
    }
    
    // Server-side specific checks
    
    // 1. Check for prerender/prefetch requests (should use database)
    const purpose = headersList.get('purpose')
    if (purpose === 'prefetch' || purpose === 'prerender') {
      return true
    }
    
    // 2. Check for X-Forwarded-For patterns indicating bot farms
    const xForwardedFor = headersList.get('x-forwarded-for')
    if (xForwardedFor) {
      // Multiple IPs often indicate proxy/bot usage
      const ips = xForwardedFor.split(',').length
      if (ips > 3) {
        return true
      }
    }
    
    // 3. Check referer patterns
    const referer = headersList.get('referer')
    if (referer && (
      referer.includes('facebook.com') ||
      referer.includes('t.co') ||
      referer.includes('linkedin.com') ||
      referer.includes('google.com/search') ||
      referer.includes('amazonaws.com') ||
      referer.includes('aws.amazon.com') ||
      referer.includes('ec2.internal')
    )) {
      // Social media, search engine, and AWS referrals often indicate bot crawling
      return true
    }
    
    // 4. Check for missing Accept header (common for simple bots)
    const acceptHeader = headersList.get('accept')
    if (!acceptHeader || acceptHeader === '*/*') {
      return true
    }
    
    // 5. Check for missing Accept-Language (humans usually have this)
    const acceptLanguage = headersList.get('accept-language')
    if (!acceptLanguage) {
      return true
    }
    
    // 6. Check for suspicious Accept-Encoding patterns
    const acceptEncoding = headersList.get('accept-encoding')
    if (!acceptEncoding || acceptEncoding === 'identity') {
      return true
    }
    
    // 7. Check for missing DNT or Sec- headers (modern browsers include these)
    const secFetchSite = headersList.get('sec-fetch-site')
    const secFetchMode = headersList.get('sec-fetch-mode')
    
    // If no sec-fetch headers and modern user agent, likely a bot
    if (!secFetchSite && !secFetchMode && userAgent.includes('chrome')) {
      return true
    }
    
    // 8. Check for suspicious hosting/cloud indicators in headers
    const host = headersList.get('host') || ''
    const via = headersList.get('via') || ''
    const server = headersList.get('server') || ''
    
    const cloudIndicators = ['aws', 'amazon', 'ec2', 'lambda', 'cloudfront', 'elastic', 'compute']
    const hasCloudIndicator = cloudIndicators.some(indicator => 
      host.includes(indicator) || via.includes(indicator) || server.includes(indicator)
    )
    
    if (hasCloudIndicator) {
      return true
    }
    
    // 9. Check for automation/preview build indicators
    const buildHeaders = [
      'x-vercel-deployment-url',
      'x-netlify-deploy-context', 
      'x-github-delivery',
      'x-forwarded-proto',
    ]
    
    const hasAutomationHeader = buildHeaders.some(header => headersList.get(header))
    if (hasAutomationHeader && !userAgent.includes('mozilla')) {
      return true // Automation with non-browser user agent
    }
    
    // Final heuristic: Very short user agents are usually bots
    if (userAgent.length < 20) {
      return true
    }
    
    return false
    
  } catch (error) {
    console.error('Error in server-side bot detection:', error)
    return false
  }
}
