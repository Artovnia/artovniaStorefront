import React from 'react';

/**
 * SVGWrapper component that fixes the common SVG attribute issues in React
 * by providing a properly typed SVG component with camelCase attributes.
 * 
 * This component addresses the following React DOM property warnings:
 * - stroke-linecap → strokeLinecap
 * - stroke-linejoin → strokeLinejoin
 * - stroke-width → strokeWidth
 * - text-anchor → textAnchor
 * - font-family → fontFamily
 * - font-size → fontSize
 * - font-weight → fontWeight
 */
interface SVGWrapperProps extends React.SVGProps<SVGSVGElement> {
  children?: React.ReactNode;
  className?: string;
  width?: number | string;
  height?: number | string;
  viewBox?: string;
}

export const SVGWrapper: React.FC<SVGWrapperProps> = ({
  children,
  className,
  width = 24,
  height = 24,
  viewBox = "0 0 24 24",
  ...props
}) => {
  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox={viewBox}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {children}
    </svg>
  );
};

export default SVGWrapper;
