'use client'

import { VendorPage, VendorPageBlock } from '@/lib/data/vendor-page'
import { BlockWrapper } from './BlockWrapper'
import {
  HeroBlock,
  RichTextBlock,
  ImageGalleryBlock,
  ImageTextBlock,
  QuoteBlock,
  VideoBlock,
  ProcessBlock,
  FeaturedProductsBlock
} from './blocks'
import { TimelineBlock } from './blocks/TimelineBlock'
import { TeamBlock } from './blocks/TeamBlock'
import { CategoriesBlock } from './blocks/CategoriesBlock'
import { SpacerBlock } from './blocks/SpacerBlock'

interface VendorPageRendererProps {
  page: VendorPage
  sellerId: string
  sellerHandle?: string
}

export const VendorPageRenderer = ({ page, sellerId, sellerHandle }: VendorPageRendererProps) => {
  const { blocks, settings } = page
  const animationSetting = settings?.animations || 'subtle'

  // Sort blocks by order
  const sortedBlocks = [...blocks].sort((a, b) => a.order - b.order)

  const renderBlock = (block: VendorPageBlock) => {
    switch (block.type) {
      case 'hero':
        return <HeroBlock data={block.data} />
      case 'rich_text':
        return <RichTextBlock data={block.data} />
      case 'image_gallery':
        return <ImageGalleryBlock data={block.data} />
      case 'image_text':
        return <ImageTextBlock data={block.data} />
      case 'quote':
        return <QuoteBlock data={block.data} />
      case 'video':
        return <VideoBlock data={block.data} />
      case 'process':
        return <ProcessBlock data={block.data} />
      case 'featured_products':
        return <FeaturedProductsBlock data={block.data} sellerId={sellerId} />
      case 'timeline':
        return <TimelineBlock data={block.data} />
      case 'team':
        return <TeamBlock data={block.data} />
      case 'categories':
        return <CategoriesBlock data={block.data} sellerHandle={sellerHandle} />
      case 'spacer':
        return <SpacerBlock data={block.data} />
      default:
        console.warn(`Unknown block type: ${block.type}`)
        return null
    }
  }

  return (
    <div className="space-y-12">
      {sortedBlocks.map((block, index) => (
        <BlockWrapper
          key={block.id}
          blockMotion={block.motion}
          animationSetting={animationSetting}
          index={index}
        >
          {renderBlock(block)}
        </BlockWrapper>
      ))}
    </div>
  )
}
