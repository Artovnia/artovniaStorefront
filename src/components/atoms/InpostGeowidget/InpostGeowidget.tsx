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
        
        const geowidget = document.createElement('inpost-geowidget');
        geowidget.setAttribute('token', token);
        geowidget.setAttribute('language', language);
        geowidget.setAttribute('config', config);
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
    }, 300);

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