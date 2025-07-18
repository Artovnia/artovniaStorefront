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

    // Store ref value in variable inside the effect
    const container = containerRef.current;

    // Create the custom element
    const geowidget = document.createElement('inpost-geowidget');
    geowidget.setAttribute('token', token);
    geowidget.setAttribute('language', language);
    geowidget.setAttribute('config', config);
    if (onpoint) {
      geowidget.setAttribute('onpoint', onpoint);
    }

    // Clear container and append the element
    container.innerHTML = '';
    container.appendChild(geowidget);

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