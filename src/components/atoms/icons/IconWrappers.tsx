import React from 'react'
import { 
  // Common icons in checkout
  CheckCircleSolid, 
  ChevronUpDown, 
  Loader as LoaderIcon, 
  CreditCard, 
  
  // Additional commonly used icons
  ArrowRight,
  ArrowLeft,
  ShoppingBag,
  User,
  Check,
  XMark,
  InformationCircle,
  ExclamationCircle,
  QuestionMarkCircle,
  MapPin,
  Trash
} from '@medusajs/icons'

/**
 * This file contains wrapper components for all Medusa icons used throughout the application
 * to ensure proper camelCase SVG attributes as required by React.
 * 
 * These wrappers fix the React warnings about invalid DOM properties like:
 * - stroke-linecap → strokeLinecap
 * - stroke-linejoin → strokeLinejoin
 * - stroke-width → strokeWidth
 * - text-anchor → textAnchor
 * - font-family → fontFamily
 * - font-size → fontSize
 * - font-weight → fontWeight
 * 
 * Usage:
 * import { CheckCircleSolidWrapper } from '@/components/atoms/icons/IconWrappers'
 * 
 * <CheckCircleSolidWrapper className="w-5 h-5" />
 */

// Define specific types for each icon to avoid type mismatches
type CheckCircleSolidProps = React.ComponentPropsWithoutRef<typeof CheckCircleSolid>;
type ChevronUpDownProps = React.ComponentPropsWithoutRef<typeof ChevronUpDown>;
type LoaderIconProps = React.ComponentPropsWithoutRef<typeof LoaderIcon>;
type CreditCardProps = React.ComponentPropsWithoutRef<typeof CreditCard>;
type MapPinProps = React.ComponentPropsWithoutRef<typeof MapPin>;
type TrashProps = React.ComponentPropsWithoutRef<typeof Trash>;
type ArrowRightProps = React.ComponentPropsWithoutRef<typeof ArrowRight>;
type ArrowLeftProps = React.ComponentPropsWithoutRef<typeof ArrowLeft>;
type ShoppingBagProps = React.ComponentPropsWithoutRef<typeof ShoppingBag>;
type UserProps = React.ComponentPropsWithoutRef<typeof User>;
type CheckProps = React.ComponentPropsWithoutRef<typeof Check>;
type XMarkProps = React.ComponentPropsWithoutRef<typeof XMark>;
type InformationCircleProps = React.ComponentPropsWithoutRef<typeof InformationCircle>;
type ExclamationCircleProps = React.ComponentPropsWithoutRef<typeof ExclamationCircle>;
type QuestionMarkCircleProps = React.ComponentPropsWithoutRef<typeof QuestionMarkCircle>;


// CheckCircleSolid Icon Wrapper
export const CheckCircleSolidWrapper = React.forwardRef<SVGSVGElement, CheckCircleSolidProps>(
  (props, ref) => {
    return <CheckCircleSolid ref={ref} {...props} />
  }
)
CheckCircleSolidWrapper.displayName = 'CheckCircleSolidWrapper'

// ChevronUpDown Icon Wrapper
export const ChevronUpDownWrapper = React.forwardRef<SVGSVGElement, ChevronUpDownProps>(
  (props, ref) => {
    return <ChevronUpDown ref={ref} {...props} />
  }
)
ChevronUpDownWrapper.displayName = 'ChevronUpDownWrapper'

// Loader Icon Wrapper
export const LoaderWrapper = React.forwardRef<SVGSVGElement, LoaderIconProps>(
  (props, ref) => {
    return <LoaderIcon ref={ref} {...props} />
  }
)
LoaderWrapper.displayName = 'LoaderWrapper'

// CreditCard Icon Wrapper
export const CreditCardWrapper = React.forwardRef<SVGSVGElement, CreditCardProps>(
  (props, ref) => {
    return <CreditCard ref={ref} {...props} />
  }
)
CreditCardWrapper.displayName = 'CreditCardWrapper'

// MapPin Icon Wrapper
export const MapPinWrapper = React.forwardRef<SVGSVGElement, MapPinProps>(
  (props, ref) => {
    return <MapPin ref={ref} {...props} />
  }
)
MapPinWrapper.displayName = 'MapPinWrapper'

// Trash Icon Wrapper
export const TrashWrapper = React.forwardRef<SVGSVGElement, TrashProps>(
  (props, ref) => {
    return <Trash ref={ref} {...props} />
  }
)
TrashWrapper.displayName = 'TrashWrapper'

// ArrowRight Icon Wrapper
export const ArrowRightWrapper = React.forwardRef<SVGSVGElement, ArrowRightProps>(
  (props, ref) => {
    return <ArrowRight ref={ref} {...props} />
  }
)
ArrowRightWrapper.displayName = 'ArrowRightWrapper'

// ArrowLeft Icon Wrapper
export const ArrowLeftWrapper = React.forwardRef<SVGSVGElement, ArrowLeftProps>(
  (props, ref) => {
    return <ArrowLeft ref={ref} {...props} />
  }
)
ArrowLeftWrapper.displayName = 'ArrowLeftWrapper'

// ShoppingBag Icon Wrapper
export const ShoppingBagWrapper = React.forwardRef<SVGSVGElement, ShoppingBagProps>(
  (props, ref) => {
    return <ShoppingBag ref={ref} {...props} />
  }
)
ShoppingBagWrapper.displayName = 'ShoppingBagWrapper'

// User Icon Wrapper
export const UserWrapper = React.forwardRef<SVGSVGElement, UserProps>(
  (props, ref) => {
    return <User ref={ref} {...props} />
  }
)
UserWrapper.displayName = 'UserWrapper'

// Check Icon Wrapper
export const CheckWrapper = React.forwardRef<SVGSVGElement, CheckProps>(
  (props, ref) => {
    return <Check ref={ref} {...props} />
  }
)
CheckWrapper.displayName = 'CheckWrapper'

// XMark Icon Wrapper
export const XMarkWrapper = React.forwardRef<SVGSVGElement, XMarkProps>(
  (props, ref) => {
    return <XMark ref={ref} {...props} />
  }
)
XMarkWrapper.displayName = 'XMarkWrapper'

// InformationCircle Icon Wrapper
export const InformationCircleWrapper = React.forwardRef<SVGSVGElement, InformationCircleProps>(
  (props, ref) => {
    return <InformationCircle ref={ref} {...props} />
  }
)
InformationCircleWrapper.displayName = 'InformationCircleWrapper'

// ExclamationCircle Icon Wrapper
export const ExclamationCircleWrapper = React.forwardRef<SVGSVGElement, ExclamationCircleProps>(
  (props, ref) => {
    return <ExclamationCircle ref={ref} {...props} />
  }
)
ExclamationCircleWrapper.displayName = 'ExclamationCircleWrapper'

// QuestionMarkCircle Icon Wrapper
export const QuestionMarkCircleWrapper = React.forwardRef<SVGSVGElement, QuestionMarkCircleProps>(
  (props, ref) => {
    return <QuestionMarkCircle ref={ref} {...props} />
  }
)
QuestionMarkCircleWrapper.displayName = 'QuestionMarkCircleWrapper'
