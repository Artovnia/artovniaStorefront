"use client"

import { useEffect, useState } from 'react'
import Script from 'next/script'

interface CookiePreferences {
  necessary: boolean
  functional: boolean
  analytics: boolean
  marketing: boolean
  performance: boolean
}

export const ConsentAwareAnalytics = () => {
  const [preferences, setPreferences] = useState<CookiePreferences | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const checkConsent = () => {
      const stored = localStorage.getItem('artovnia-cookie-preferences')
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          setPreferences(parsed)
        } catch (e) {
          console.error('Failed to parse cookie preferences:', e)
        }
      }
    }

    checkConsent()

    // Listen for consent changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'artovnia-cookie-preferences') {
        checkConsent()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    
    // Custom event for same-tab updates
    const handleConsentUpdate = () => checkConsent()
    window.addEventListener('cookie-consent-updated', handleConsentUpdate)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('cookie-consent-updated', handleConsentUpdate)
    }
  }, [])

  // Don't load anything until we know user's preferences
  if (!preferences) return null

  return (
    <>
      {/* Google Analytics - Only if analytics consent given */}
      {preferences.analytics && (
        <>
          <Script
            src="https://www.googletagmanager.com/gtag/js?id=G-0T68CBFP9J"
            strategy="afterInteractive"
            onLoad={() => setLoaded(true)}
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              if (typeof window !== 'undefined') {
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'G-0T68CBFP9J', {
                  anonymize_ip: true,
                  cookie_flags: 'SameSite=None;Secure'
                });
              }
            `}
          </Script>
        </>
      )}

      {/* SiteBehaviour - Only if analytics consent given */}
      {preferences.analytics && (
        <Script id="site-behaviour" strategy="lazyOnload">
          {`
            (function() {
              try {
                if (window.location && window.location.search && window.location.search.indexOf('capture-sitebehaviour-heatmap') !== -1) {
                  sessionStorage.setItem('capture-sitebehaviour-heatmap', '_');
                }

                var sbSiteSecret = 'aa0eb720-53da-4894-be51-d1cc9ff15968';
                window.sitebehaviourTrackingSecret = sbSiteSecret;
                var scriptElement = document.createElement('script');
                scriptElement.defer = true;
                scriptElement.id = 'site-behaviour-script-v2';
                scriptElement.src = 'https://sitebehaviour-cdn.fra1.cdn.digitaloceanspaces.com/index.min.js?sitebehaviour-secret=' + sbSiteSecret;
                document.head.appendChild(scriptElement);
              }
              catch (e) {
                console.error('SiteBehaviour initialization error:', e);
              }
            })();
          `}
        </Script>
      )}

      {/* Facebook Pixel - Only if marketing consent given */}
      {preferences.marketing && process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID && (
        <Script id="facebook-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID}');
            fbq('track', 'PageView');
          `}
        </Script>
      )}

      {/* Pinterest Tag - Only if marketing consent given */}
      {preferences.marketing && process.env.NEXT_PUBLIC_PINTEREST_TAG_ID && (
        <Script id="pinterest-tag" strategy="afterInteractive">
          {`
            !function(e){if(!window.pintrk){window.pintrk = function () {
            window.pintrk.queue.push(Array.prototype.slice.call(arguments))};
            var n=window.pintrk;n.queue=[],n.version="3.0";
            var t=document.createElement("script");t.async=!0,
            t.src=e;var r=document.getElementsByTagName("script")[0];
            r.parentNode.insertBefore(t,r)}}("https://s.pinimg.com/ct/core.js");
            pintrk('load', '${process.env.NEXT_PUBLIC_PINTEREST_TAG_ID}');
            pintrk('page');
          `}
        </Script>
      )}
    </>
  )
}
