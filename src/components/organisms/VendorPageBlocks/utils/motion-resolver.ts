import { Variants } from 'framer-motion'

export type AnimationSetting = 'none' | 'subtle' | 'expressive'
export type MotionEnter = 'none' | 'fade' | 'fade-up' | 'slide-left' | 'slide-right'

export interface BlockMotion {
  enter: MotionEnter
  stagger?: boolean
  delay?: number
}

const subtleVariants: Record<MotionEnter, Variants> = {
  none: {},
  fade: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.4 } }
  },
  'fade-up': {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  },
  'slide-left': {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } }
  },
  'slide-right': {
    hidden: { opacity: 0, x: 30 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } }
  }
}

const expressiveVariants: Record<MotionEnter, Variants> = {
  none: {},
  fade: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.6 } }
  },
  'fade-up': {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } }
  },
  'slide-left': {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: 'easeOut' } }
  },
  'slide-right': {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: 'easeOut' } }
  }
}

export function resolveMotion(
  blockMotion: BlockMotion | undefined,
  globalSetting: AnimationSetting
): Variants | null {
  if (globalSetting === 'none' || !blockMotion?.enter || blockMotion.enter === 'none') {
    return null
  }

  const variants = globalSetting === 'subtle' ? subtleVariants : expressiveVariants
  return variants[blockMotion.enter] || null
}

export function getStaggerDelay(index: number, stagger: boolean = false): number {
  return stagger ? index * 0.1 : 0
}
