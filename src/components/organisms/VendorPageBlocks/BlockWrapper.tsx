'use client'

import { motion, useInView } from 'framer-motion'
import { ReactNode, useRef } from 'react'
import { resolveMotion, getStaggerDelay, AnimationSetting, BlockMotion } from './utils/motion-resolver'

interface BlockWrapperProps {
  children: ReactNode
  blockMotion?: BlockMotion
  animationSetting: AnimationSetting
  index: number
  className?: string
}

export const BlockWrapper = ({
  children,
  blockMotion,
  animationSetting,
  index,
  className = ''
}: BlockWrapperProps) => {
  const ref = useRef(null)
  const variants = resolveMotion(blockMotion, animationSetting)

  // For expressive animations, use once: false to animate on both scroll up and down
  // For subtle animations, use once: true for a cleaner experience
  const isExpressive = animationSetting === 'expressive'
  const isInView = useInView(ref, { 
    once: !isExpressive, // expressive = animate both ways, subtle = only once
    margin: '-100px' 
  })

  if (!variants) {
    return <div className={className}>{children}</div>
  }

  const delay = getStaggerDelay(index, blockMotion?.stagger)

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={variants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      transition={{ delay, duration: isExpressive ? 0.7 : 0.5, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  )
}
