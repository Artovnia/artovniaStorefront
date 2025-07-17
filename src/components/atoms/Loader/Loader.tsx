import React from "react";

interface LoaderProps {
  className?: string;
  size?: number;
}

/**
 * Custom Loader component with properly camelCased SVG attributes
 * to fix React warnings about invalid DOM properties
 */
export const Loader: React.FC<LoaderProps> = ({ 
  className = "",
  size = 24
}) => {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="status"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        strokeWidth="4"
        stroke="currentColor"
        strokeOpacity="0.25"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="4"
        stroke="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
};

export default Loader;
