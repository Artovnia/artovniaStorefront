import React, { useEffect, useState } from 'react';
import { Spinner } from '@/components/atoms/Spinner/Spinner';
import PayUHtmlHandler from './PayUHtmlHandler';

interface PaymentProcessorProps {
  cart: any;
  onPaymentComplete?: () => void;
  onPaymentError?: (error: Error) => void;
}

/**
 * Handles payment processing for different payment providers
 * Currently supports PayU HTML direct integration
 */
export const PaymentProcessor: React.FC<PaymentProcessorProps> = ({ 
  cart,
  onPaymentComplete,
  onPaymentError
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState<any>(null);
  
  useEffect(() => {
    const checkPaymentSession = async () => {
      try {
        setLoading(true);
        
        if (!cart) {
          setError('No cart found');
          return;
        }
        
        if (!cart.payment_session) {
          setError('No payment session available');
          return;
        }
        
        // Check if this is a PayU HTML direct payment
        const paymentSession = cart.payment_session;
        const sessionData = paymentSession.data || {};
        
        console.log('Processing payment session data:', sessionData);
        
        // CRITICAL: Direct redirect for PayU is the most reliable method
        // Check for redirect_url first and redirect immediately if available
        if (sessionData.redirect_url && sessionData.redirect_url !== 'about:blank') {
          console.log('Direct redirect to PayU URL:', sessionData.redirect_url);
          // Force immediate redirect to PayU - this is the most important change
          window.location.href = sessionData.redirect_url;
          return;
        }
        
        // If no direct URL but HTML content, process it
        if (sessionData.direct_html && sessionData.html_content) {
          // Extract form URL from HTML if possible
          try {
            const htmlContent = sessionData.html_content;
            const formMatch = htmlContent.match(/<form[^>]*action="([^"]+)"[^>]*>/i);
            if (formMatch && formMatch[1]) {
              console.log('Extracted URL from HTML, redirecting:', formMatch[1]);
              window.location.href = formMatch[1];
              return;
            }
          } catch (e) {
            console.error('Error extracting URL from HTML:', e);
          }
          
          // If extraction failed, use the HTML handler component
          setPaymentData({
            type: 'html',
            htmlContent: sessionData.html_content,
            redirectUrl: sessionData.redirect_url
          });
        } else if (sessionData.redirect_url) {
          // We have a redirect URL, handle it
          setPaymentData({
            type: 'redirect',
            redirectUrl: sessionData.redirect_url
          });
        } else {
          // Regular payment flow
          setPaymentData(null);
          onPaymentComplete?.();
        }
      } catch (err) {
        console.error('Error checking payment session:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        onPaymentError?.(err instanceof Error ? err : new Error('Unknown error occurred'));
      } finally {
        setLoading(false);
      }
    };
    
    checkPaymentSession();
  }, [cart, onPaymentComplete, onPaymentError]);
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <Spinner />
        <p className="mt-4">Preparing payment...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-300 rounded-md">
        <p className="text-red-500">Error: {error}</p>
        <button 
          className="mt-2 px-4 py-2 bg-red-500 text-white rounded-md"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }
  
  if (paymentData?.type === 'html' && paymentData.htmlContent) {
    return (
      <PayUHtmlHandler 
        htmlContent={paymentData.htmlContent} 
        redirectUrl={paymentData.redirectUrl} 
      />
    );
  }
  
  if (paymentData?.type === 'redirect' && paymentData.redirectUrl) {
    // Auto-redirect to the payment page
    window.location.href = paymentData.redirectUrl;
    return (
      <div className="flex flex-col items-center justify-center p-8 gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="text-lg font-medium">Redirecting to payment page...</p>
        <a 
          href={paymentData.redirectUrl} 
          className="text-blue-500 underline"
        >
          Click here if you are not redirected automatically
        </a>
      </div>
    );
  }
  
  return null;
};

export default PaymentProcessor;
