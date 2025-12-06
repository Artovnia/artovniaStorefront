"use client"

import React, { useEffect, useRef } from 'react';

interface InpostGeowidgetProps {
  token: string;
  language: string;
  config: string;
  onpoint?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const InpostGeowidget: React.FC<InpostGeowidgetProps> = ({
  token,
  language,
  config,
  onpoint,
  className,
  style
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    
    // Set up the global point selection function as per documentation
    // This function will be called by the InPost widget when user clicks "Wybierz"
    (window as any).afterPointSelected = (point: any) => {
  
      const callback = (window as any).__inpostPointCallback;
      if (callback && typeof callback === 'function') {
        try {
         
          callback(point);
        } catch (err) {
          console.error('❌ Error in __inpostPointCallback:', err);
        }
      } else {
        console.warn('⚠️ No __inpostPointCallback found or not a function:', typeof callback);
      }
    };
    
    // Also set up alternative callback names in case the widget uses different naming
    (window as any).onPointSelect = (window as any).afterPointSelected;
    (window as any).handlePointSelection = (window as any).afterPointSelected;
    

    // Store ref value in variable inside the effect
    const container = containerRef.current;

    // Wait a moment to ensure the DOM is stable and geowidget script is loaded
    setTimeout(() => {
      try {
        if (!customElements.get('inpost-geowidget')) {
          console.error('InpostGeowidget: Custom element not registered. Ensure the JS file loaded correctly.');
          return;
        }
        
      

        // Create the geowidget element with correct attributes per documentation
        const geowidget = document.createElement('inpost-geowidget');
        geowidget.setAttribute('token', token);
        geowidget.setAttribute('language', language || 'pl');
        geowidget.setAttribute('config', 'parcelcollect'); // Use simple config as per docs
        
        // Set the onpoint attribute to use event-based approach as well
        geowidget.setAttribute('onpoint', 'onpointselect');
        
       

        // Add error handling
        geowidget.addEventListener('error', (e) => {
          console.error('InpostGeowidget: Error in geowidget element:', e);
        });

        // Add event listener for point selection (alternative approach from docs)
        document.addEventListener('onpointselect', (event: any) => {
       
          if (event.detail && event.detail.name) {
          
            const callback = (window as any).__inpostPointCallback;
            if (callback && typeof callback === 'function') {
              try {
                callback(event.detail);
              } catch (err) {
                console.error('❌ Error in event-based callback:', err);
              }
            }
          }
        });
        
        // Also listen for the geowidget init event to get API access
        geowidget.addEventListener('inpost.geowidget.init', (event: any) => {
     
          if (event.detail && event.detail.api) {
            // Store API reference for potential future use
            (window as any).__inpostGeowidgetApi = event.detail.api;
          }
        });

        // Clear container and append the element
        container.innerHTML = '';
        container.appendChild(geowidget);
      
      } catch (error) {
        console.error('InpostGeowidget: Error during initialization:', error);
      }
    }, 500); // Increased timeout for better stability

    return () => {
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [token, language, config, onpoint]);

  return (
    <div 
      ref={containerRef} 
      className={className}
      style={style}
    />
  );
};

export default InpostGeowidget;