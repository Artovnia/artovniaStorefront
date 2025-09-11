// Bot detection utility for redirecting bots to database queries instead of Algolia

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
  'uptimerobot',
  'pingdom',
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

// Cloud server and hosting patterns that indicate automated traffic
const CLOUD_PATTERNS = [
  'aws',
  'amazon',
  'ec2',
  'lambda',
  'cloudfront',
  'elastic',
  'compute',
  'cloud',
  'server',
  'hosting',
  'vps',
  'dedicated',
]

// Suspicious user agent patterns that indicate non-human traffic
const SUSPICIOUS_PATTERNS = [
  // Empty or minimal user agents
  /^$/,
  /^\s*$/,
  /^-$/,
  /^null$/i,
  /^undefined$/i,
  // Very short user agents (less than 10 characters)
  /^.{1,9}$/,
  // Programming language specific
  /python/i,
  /java/i,
  /ruby/i,
  /php/i,
  /perl/i,
  /go-http/i,
  /node/i,
  // Generic HTTP clients
  /httpclient/i,
  /okhttp/i,
  /apache-httpclient/i,
  /jersey/i,
  // Missing version numbers (bots often don't include proper versions)
  /mozilla\/[0-9]+\.[0-9]+$/i,
  /chrome\/[0-9]+$/i,
  /safari\/[0-9]+$/i,
]

/**
 * Detects if the current request is from a bot/crawler using user agent only
 * Returns true if bot detected, false for human users
 */
export function isBotRequest(userAgent?: string): boolean {
  try {
    const ua = (userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : '')).toLowerCase()
    
    // Debug logging for troubleshooting
    const debugLog = (reason: string, pattern?: string) => {
      console.log(`🔍 Bot Detection Rule Triggered: ${reason}`, {
        userAgent: ua,
        pattern: pattern || 'N/A',
        originalUA: userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : '')
      })
    }
    
    // Check for empty or missing user agent (common for bots)
    if (!ua || ua.trim() === '') {
      debugLog('Empty user agent')
      return true
    }
    
    // Check against known bot user agents
    const matchedBotAgent = BOT_USER_AGENTS.find(botAgent => ua.includes(botAgent))
    if (matchedBotAgent) {
      debugLog('Known bot user agent', matchedBotAgent)
      return true
    }
    
    // Check for headless browser patterns
    const matchedHeadless = HEADLESS_PATTERNS.find(pattern => ua.includes(pattern))
    if (matchedHeadless) {
      debugLog('Headless browser pattern', matchedHeadless)
      return true
    }
    
    // Check for cloud server patterns
    const matchedCloud = CLOUD_PATTERNS.find(pattern => ua.includes(pattern))
    if (matchedCloud) {
      debugLog('Cloud server pattern', matchedCloud)
      return true
    }
    
    // Check suspicious patterns with regex
    const matchedSuspicious = SUSPICIOUS_PATTERNS.find(pattern => pattern.test(ua))
    if (matchedSuspicious) {
      debugLog('Suspicious regex pattern', matchedSuspicious.toString())
      return true
    }
    
    // Additional heuristics for bot detection
    
    // 1. User agents that are too simple (missing common browser info)
    if (!ua.includes('mozilla') && !ua.includes('webkit') && !ua.includes('gecko')) {
      debugLog('Missing browser engine info (mozilla/webkit/gecko)')
      return true
    }
    
    // 2. User agents with suspicious version patterns (but allow Opera and Edge)
    if (ua.includes('chrome') && !ua.includes('safari') && !ua.includes('opr') && !ua.includes('edg')) {
      debugLog('Chrome without Safari (and not Opera/Edge)')
      return true // Real Chrome always includes Safari in UA, Opera includes OPR, Edge includes Edg
    }
    
    // 3. Missing common browser components
    if (ua.includes('mozilla') && !ua.includes('(') && !ua.includes(')')) {
      debugLog('Mozilla without parentheses')
      return true // Real browsers have parentheses with system info
    }
    
    return false
    
  } catch (error) {
    console.error('Error in bot detection:', error)
    // On error, assume human user to avoid blocking real users
    return false
  }
}


/**
 * Client-side bot detection (less reliable but faster)
 * Use this for conditional rendering after hydration
 */
export function isClientSideBot(): boolean {
  if (typeof window === 'undefined') {
    return false // Server-side, use server detection instead
  }
  
  try {
    const userAgent = navigator.userAgent?.toLowerCase() || ''
    
    // Debug logging for client-side detection
    const debugLog = (reason: string, detail?: any) => {
      console.log(`🔍 Client-Side Bot Detection Rule Triggered: ${reason}`, {
        userAgent,
        detail,
        originalUA: navigator.userAgent
      })
    }
    
    // Quick client-side checks
    const matchedBotAgent = BOT_USER_AGENTS.find(botAgent => userAgent.includes(botAgent))
    if (matchedBotAgent) {
      debugLog('Known bot user agent', matchedBotAgent)
      return true
    }
    
    // Check for missing browser features that bots often lack
    const missingFeatures = []
    if (!window.requestAnimationFrame) missingFeatures.push('requestAnimationFrame')
    if (!window.localStorage) missingFeatures.push('localStorage')
    if (!window.sessionStorage) missingFeatures.push('sessionStorage')
    if (!document.cookie) missingFeatures.push('document.cookie')
    
    if (missingFeatures.length > 0) {
      debugLog('Missing browser features', missingFeatures)
      return true
    }
    
    // Check for automation indicators
    const automationIndicators = []
    if ((window as any).webdriver) automationIndicators.push('webdriver')
    if ((window as any).__nightmare) automationIndicators.push('__nightmare')
    if ((window as any).phantom) automationIndicators.push('phantom')
    if ((window as any).callPhantom) automationIndicators.push('callPhantom')
    
    if (automationIndicators.length > 0) {
      debugLog('Automation indicators found', automationIndicators)
      return true
    }
    
    return false
    
  } catch (error) {
    console.error('Error in client-side bot detection:', error)
    return false
  }
}

/**
 * Development helper to force bot mode for testing
 */
export function forceBotMode(): boolean {
  return (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') && 
         (process.env.FORCE_BOT_MODE === 'true' || process.env.NEXT_PUBLIC_FORCE_BOT_MODE === 'true')
}

/**
 * Simple user agent based bot detection for client components
 * This is the main function to use in client components
 */
export function detectBot(userAgent?: string): boolean {
  if (forceBotMode()) {
    return true
  }
  
  return isBotRequest(userAgent) || isClientSideBot()
}
