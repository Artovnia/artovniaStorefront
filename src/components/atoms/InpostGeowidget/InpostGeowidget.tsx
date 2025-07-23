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
    
    // Set up global InPost configuration
    try {
      // Create the global InPost namespace if it doesn't exist
      if (!(window as any).InPost) {
        (window as any).InPost = {};
      }
      
      // Configure InPost settings (official configuration format)
      (window as any).InPost.config = {
        apiUrl: 'https://api.inpost.pl/v2',
        token: token,
        language: language || 'pl',
        config: config || 'parcelcollect,modern',
        points: {
          types: ['parcel_locker'],
          functions: ['parcel_collect']
        },
        map: {
          initialTypes: ['parcel_locker'],
          defaultDistance: 10,
          useGeolocation: true
        },
        display: {
          showTypesFilters: true,
          showSearchBar: true,
          showPointInfo: true
        }
      };
      
      console.log('InpostGeowidget: Added InPost config to window');
    } catch (error) {
      console.error('InpostGeowidget: Error setting up InPost config:', error);
    }

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

        // Define onPointSelect globally to ensure it's available
        (window as any).onPointSelect = (point: any) => {
          console.log('Global onPointSelect called with point:', point);
          const callback = (window as any).__inpostPointCallback;
          if (callback && typeof callback === 'function') {
            try {
              callback(point);
            } catch (err) {
              console.error('Error in __inpostPointCallback:', err);
            }
          }
        };
        
        const geowidget = document.createElement('inpost-geowidget');
        geowidget.setAttribute('token', token);
        geowidget.setAttribute('language', language || 'pl');
        geowidget.setAttribute('config', config || 'parcelcollect,modern');
        if (onpoint) {
          geowidget.setAttribute('onpoint', onpoint);
        }

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