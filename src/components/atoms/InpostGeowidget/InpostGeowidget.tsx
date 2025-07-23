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
    console.log('InpostGeowidget: Initializing with token length:', token?.length);
    
    // Set up the global point selection function as per documentation
    (window as any).afterPointSelected = (point: any) => {
      console.log('afterPointSelected called with point:', point);
      const callback = (window as any).__inpostPointCallback;
      if (callback && typeof callback === 'function') {
        try {
          callback(point);
        } catch (err) {
          console.error('Error in __inpostPointCallback:', err);
        }
      }
    };
    
    console.log('InpostGeowidget: Global afterPointSelected function set up');

    // Store ref value in variable inside the effect
    const container = containerRef.current;

    // Wait a moment to ensure the DOM is stable and geowidget script is loaded
    setTimeout(() => {
      try {
        if (!customElements.get('inpost-geowidget')) {
          console.error('InpostGeowidget: Custom element not registered. Ensure the JS file loaded correctly.');
          return;
        }
        
        // Create the custom element
        console.log('InpostGeowidget: Creating custom element with config:', {
          token: token ? `${token.substring(0, 5)}...` : 'missing',
          language,
          config,
          onpoint
        });

        // Create the geowidget element with correct attributes per documentation
        const geowidget = document.createElement('inpost-geowidget');
        geowidget.setAttribute('token', token);
        geowidget.setAttribute('language', language || 'pl');
        geowidget.setAttribute('config', 'parcelcollect'); // Use simple config as per docs
        
        // Use the global function name for point selection (basic integration)
        // The widget will call window.afterPointSelected when a point is selected
        // No need to set onpoint attribute - using global function approach

        // Add error handling
        geowidget.addEventListener('error', (e) => {
          console.error('InpostGeowidget: Error in geowidget element:', e);
        });

        // Clear container and append the element
        container.innerHTML = '';
        container.appendChild(geowidget);
        console.log('InpostGeowidget: Custom element appended to DOM');
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