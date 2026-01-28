'use client'

import Image from 'next/image'

interface TimelineEvent {
  year: string
  title: string
  description?: string
  image_url?: string
  image_id?: string
}

interface TimelineBlockData {
  title?: string
  title_alignment?: 'left' | 'center' | 'right'
  title_italic?: boolean
  events: TimelineEvent[]
  layout?: 'alternating' | 'vertical' | 'horizontal'
  badge_style?: 'solid' | 'outline' | 'minimal' | 'pill' | 'rounded'
  rounded_edges?: boolean
}

interface TimelineBlockProps {
  data: TimelineBlockData
}

export const TimelineBlock = ({ data }: TimelineBlockProps) => {
  const { 
    title, 
    title_alignment = 'center',
    title_italic = false,
    events = [], 
    layout = 'alternating', 
    badge_style = 'solid',
    rounded_edges = true 
  } = data

  if (!events.length) {
    return null
  }

  // Badge style classes
  const getBadgeClasses = () => {
    const baseClasses = 'inline-block px-3 py-1 text-sm font-bold mb-3'
    const roundingClasses = rounded_edges ? 'rounded' : ''
    
    switch (badge_style) {
      case 'solid':
        return `${baseClasses} bg-[#3B3634] text-[#F4F0EB] ${roundingClasses}`
      case 'outline':
        return `${baseClasses} border-2 border-[#3B3634] text-[#3B3634] bg-transparent ${roundingClasses}`
      case 'minimal':
        return `${baseClasses} text-[#3B3634] bg-[#3B3634]/10 ${roundingClasses}`
      case 'pill':
        return `${baseClasses} bg-[#3B3634] text-[#F4F0EB] rounded-full`
      case 'rounded':
        return `${baseClasses} bg-[#3B3634] text-[#F4F0EB] rounded-lg`
      default:
        return `${baseClasses} bg-[#3B3634] text-[#F4F0EB] ${roundingClasses}`
    }
  }

  // Title alignment classes
  const titleAlignmentClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  }

  const titleClasses = `text-xl md:text-2xl font-instrument-serif ${titleAlignmentClasses[title_alignment]} ${title_italic ? 'italic' : ''}`

  // Alternating Layout (original)
  if (layout === 'alternating') {
    return (
      <div className="space-y-8">
        {title && (
          <h2 className={titleClasses}>{title}</h2>
        )}
        
        <div className="relative">
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-[#3B3634]/20 md:transform md:-translate-x-1/2" />
          
          <div className="space-y-8 md:space-y-12">
            {events.map((event, index) => (
              <div 
                key={index} 
                className={`relative flex flex-col md:flex-row gap-4 md:gap-8 ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                <div className="absolute left-4 md:left-1/2 top-5 w-4 h-4 rounded-full bg-[#3B3634] border-4 border-white md:transform md:-translate-x-1/2 z-10" />
                
                <div className={`ml-10 md:ml-0 md:w-1/2 ${index % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12'}`}>
                  <div className={`bg-[#F4F0EB] p-5 ${rounded_edges ? 'rounded-lg' : ''}`}>
                    <span className={getBadgeClasses()}>
                      {event.year}
                    </span>
                    <h3 className="text-lg font-instrument-serif mb-2">{event.title}</h3>
                    {event.description && (
                      <p className="text-sm text-[#3B3634]/70">{event.description}</p>
                    )}
                    {event.image_url && (
                      <div className={`relative mt-4 overflow-hidden aspect-video ${rounded_edges ? 'rounded-lg' : ''}`}>
                        <Image
                          src={event.image_url}
                          alt={event.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="hidden md:block md:w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Vertical Layout
  if (layout === 'vertical') {
    return (
      <div className="space-y-6">
        {title && (
          <h2 className={titleClasses}>{title}</h2>
        )}
        
        <div className="max-w-3xl mx-auto">
          <div className="relative pl-8 border-l-2 border-[#3B3634]/20 space-y-6">
            {events.map((event, index) => (
              <div key={index} className="relative">
                <div className="absolute -left-[17px] top-5 w-4 h-4 rounded-full bg-[#3B3634] border-4 border-white" />
                
                <div className={`bg-[#F4F0EB] p-5 ${rounded_edges ? 'rounded-lg' : ''}`}>
                  <span className={getBadgeClasses()}>
                    {event.year}
                  </span>
                  <h3 className="text-lg font-instrument-serif mb-2">{event.title}</h3>
                  {event.description && (
                    <p className="text-sm text-[#3B3634]/70 mb-3">{event.description}</p>
                  )}
                  {event.image_url && (
                    <div className={`relative mt-3 overflow-hidden aspect-video ${rounded_edges ? 'rounded-lg' : ''}`}>
                      <Image
                        src={event.image_url}
                        alt={event.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 768px"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Horizontal Layout
  if (layout === 'horizontal') {
    return (
      <div className="space-y-6">
        {title && (
          <h2 className={titleClasses}>{title}</h2>
        )}
        
        <div className="relative">
          <div className="hidden md:block absolute top-8 left-0 right-0 h-0.5 bg-[#3B3634]/20" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {events.map((event, index) => (
              <div key={index} className="relative">
                <div className="hidden md:block absolute top-[30px] left-1/2 w-4 h-4 rounded-full bg-[#3B3634] border-4 border-white transform -translate-x-1/2 z-10" />
                
                <div className={`bg-[#F4F0EB] p-5 md:mt-12 ${rounded_edges ? 'rounded-lg' : ''}`}>
                  <span className={getBadgeClasses()}>
                    {event.year}
                  </span>
                  <h3 className="text-lg font-instrument-serif mb-2">{event.title}</h3>
                  {event.description && (
                    <p className="text-sm text-[#3B3634]/70 mb-3">{event.description}</p>
                  )}
                  {event.image_url && (
                    <div className={`relative mt-3 overflow-hidden aspect-video ${rounded_edges ? 'rounded-lg' : ''}`}>
                      <Image
                        src={event.image_url}
                        alt={event.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return null
}
