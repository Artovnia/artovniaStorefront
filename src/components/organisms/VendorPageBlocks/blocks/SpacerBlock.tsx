'use client'

interface SpacerBlockData {
  height: 'small' | 'medium' | 'large' | 'xlarge'
}

interface SpacerBlockProps {
  data: SpacerBlockData
}

export const SpacerBlock = ({ data }: SpacerBlockProps) => {
  const { height = 'medium' } = data

  const heightClasses = {
    small: 'h-8',      // 2rem / 32px
    medium: 'h-16',    // 4rem / 64px
    large: 'h-24',     // 6rem / 96px
    xlarge: 'h-32'     // 8rem / 128px
  }

  return <div className={heightClasses[height]} aria-hidden="true" />
}
