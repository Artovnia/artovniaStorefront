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
  events: TimelineEvent[]
}

interface TimelineBlockProps {
  data: TimelineBlockData
}

export const TimelineBlock = ({ data }: TimelineBlockProps) => {
  const { title, events = [] } = data

  if (!events.length) {
    return null
  }

  return (
    <div className="space-y-8">
      {title && (
        <h2 className="text-2xl md:text-3xl font-instrument-serif italic text-center">{title}</h2>
      )}
      
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-[#3B3634]/20 transform md:-translate-x-1/2" />
        
        <div className="space-y-8 md:space-y-12">
          {events.map((event, index) => (
            <div 
              key={index} 
              className={`relative flex flex-col md:flex-row gap-4 md:gap-8 ${
                index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
              }`}
            >
              {/* Timeline dot */}
              <div className="absolute left-4 md:left-1/2 w-4 h-4 rounded-full bg-[#3B3634] border-4 border-[#F4F0EB] transform -translate-x-1/2 z-10" />
              
              {/* Content */}
              <div className={`ml-10 md:ml-0 md:w-1/2 ${index % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12'}`}>
                <div className="bg-[#F4F0EB] rounded-lg p-6">
                  <span className="inline-block px-3 py-1 bg-[#3B3634] text-[#F4F0EB] text-sm font-bold rounded mb-3">
                    {event.year}
                  </span>
                  <h3 className="text-xl font-instrument-serif mb-2">{event.title}</h3>
                  {event.description && (
                    <p className="text-[#3B3634]/70">{event.description}</p>
                  )}
                  {event.image_url && (
                    <div className="relative mt-4 rounded-lg overflow-hidden aspect-video">
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
              
              {/* Spacer for alternating layout */}
              <div className="hidden md:block md:w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
