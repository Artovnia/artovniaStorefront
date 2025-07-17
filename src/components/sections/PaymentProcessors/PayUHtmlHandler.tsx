import React, { useEffect, useRef, useState } from 'react';

interface PayUHtmlHandlerProps {
  htmlContent: string;
  redirectUrl?: string;
}

/**
 * This component renders the HTML content returned by PayU directly
 * It can either:
 * 1. Render the HTML content in an iframe for embedded payment forms
 * 2. Redirect to the PayU URL if one was extracted
 * 3. Auto-submit a form if found in the HTML content
 */
export const PayUHtmlHandler: React.FC<PayUHtmlHandlerProps> = ({ htmlContent, redirectUrl }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const formContainerRef = useRef<HTMLDivElement>(null);
  const [extractedUrl, setExtractedUrl] = useState<string | undefined>(undefined);
  const [useDirectForm, setUseDirectForm] = useState(false);
  
  // Function to extract form and redirect info from HTML
  const extractPayUInfo = () => {
    // Try to find a form
    const hasForm = htmlContent.includes('<form');
    
    // Try to extract redirect URL if not provided
    if (!redirectUrl || redirectUrl === 'about:blank') {
      // Look for form action
      const formMatch = htmlContent.match(/<form[^>]*action="([^"]+)"[^>]*>/i);
      if (formMatch && formMatch[1]) {
        console.log('Found form action URL:', formMatch[1]);
        setExtractedUrl(formMatch[1]);
      }
      
      // Look for meta redirect
      const metaRedirect = htmlContent.match(/<meta[^>]*http-equiv="refresh"[^>]*content="[^"]*url=([^"]+)"[^>]*>/i);
      if (metaRedirect && metaRedirect[1]) {
        console.log('Found meta redirect URL:', metaRedirect[1]);
        setExtractedUrl(metaRedirect[1]);
      }
      
      // Look for script redirect
      const scriptRedirect = htmlContent.match(/window\.location(?:\.href)?\s*=\s*['"]([^'"]+)['"];/i);
      if (scriptRedirect && scriptRedirect[1]) {
        console.log('Found script redirect URL:', scriptRedirect[1]);
        setExtractedUrl(scriptRedirect[1]);
      }
    }
    
    // If we have a form, we can try to render it directly
    if (hasForm) {
      setUseDirectForm(true);
    }
  };
  
  useEffect(() => {
    // Extract any URLs or forms from the HTML
    extractPayUInfo();
    
    // If we have a redirect URL from props or extracted one, navigate to it directly
    const urlToUse = redirectUrl && redirectUrl !== 'about:blank' ? redirectUrl : extractedUrl;
    
    if (urlToUse) {
      console.log('Redirecting to PayU URL:', urlToUse);
      // Add a slight delay to ensure log messages are captured
      setTimeout(() => {
        window.location.href = urlToUse;
      }, 500);
      return;
    }
    
    // If we're using a direct form, render it in a div and auto-submit
    if (useDirectForm && formContainerRef.current) {
      const container = formContainerRef.current;
      container.innerHTML = htmlContent;
      
      // Find the form and auto-submit it
      const form = container.querySelector('form');
      if (form) {
        console.log('Auto-submitting PayU form');
        setTimeout(() => {
          form.submit();
        }, 1000); // Give a slight delay for the form to initialize
      }
      return;
    }
    
    // Otherwise, render in iframe as fallback
    if (htmlContent && iframeRef.current) {
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      
      if (doc) {
        doc.open();
        doc.write(htmlContent);
        doc.close();
        
        // Style the iframe to take up the full space
        iframe.style.width = '100%';
        iframe.style.height = '600px';
        iframe.style.border = 'none';
        
        // Try to find and auto-submit any form in the iframe
        try {
          const iframeForm = doc.querySelector('form');
          if (iframeForm) {
            console.log('Found form in iframe, attempting to submit');
            setTimeout(() => {
              iframeForm.submit();
            }, 1000);
          }
        } catch (error) {
          console.error('Error auto-submitting form in iframe:', error);
        }
      }
    }
  }, [htmlContent, redirectUrl, extractedUrl, useDirectForm]);
  
  // If we have a redirect URL, show a loading message
  const finalRedirectUrl = redirectUrl && redirectUrl !== 'about:blank' ? redirectUrl : extractedUrl;
  if (finalRedirectUrl) {
    return (
      <div className="flex flex-col items-center justify-center p-8 gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="text-lg font-medium">Redirecting to payment page...</p>
        <a 
          href={finalRedirectUrl}
          className="text-blue-500 underline mt-2"
          onClick={(e) => {
            window.location.href = finalRedirectUrl;
          }}
        >
          Click here if you are not redirected automatically
        </a>
      </div>
    );
  }
  
  // If we're using a direct form render
  if (useDirectForm) {
    return (
      <div className="w-full">
        <div className="mb-4 text-center">
          <p className="text-lg font-medium">Processing payment...</p>
        </div>
        <div ref={formContainerRef} className="payu-form-container" />
      </div>
    );
  }
  
  // Otherwise, render the iframe as fallback
  return (
    <div className="w-full">
      <div className="mb-4 text-center">
        <p className="text-lg font-medium">Loading payment form...</p>
      </div>
      <iframe 
        ref={iframeRef}
        title="PayU Payment Form"
        className="w-full min-h-[600px] border-none"
        sandbox="allow-forms allow-scripts allow-same-origin allow-top-navigation allow-popups"
      />
      <div className="mt-4 text-center text-sm text-gray-500">
        <p>If the payment form doesn't load automatically, please refresh the page or try again later.</p>
      </div>
    </div>
  );
};

export default PayUHtmlHandler;
