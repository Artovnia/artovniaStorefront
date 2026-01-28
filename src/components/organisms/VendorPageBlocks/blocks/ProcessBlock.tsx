'use client'

import Image from 'next/image'

interface ProcessStep {
  title: string
  description: string
  image_id?: string
  image_url?: string
}

interface ProcessBlockData {
  title?: string
  title_alignment?: 'left' | 'center' | 'right'
  title_italic?: boolean
  steps: ProcessStep[]
  layout?: 'numbered' | 'cards' | 'minimal'
  rounded_edges?: boolean
}

interface ProcessBlockProps {
  data: ProcessBlockData
}

export const ProcessBlock = ({ data }: ProcessBlockProps) => {
  const { 
    title, 
    title_alignment = 'center',
    title_italic = false,
    steps = [], 
    layout = 'numbered', 
    rounded_edges = true 
  } = data

  if (!steps.length) {
    return null
  }

  const titleAlignmentClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  }

  const titleClasses = `text-xl md:text-2xl font-instrument-serif ${titleAlignmentClasses[title_alignment]} ${title_italic ? 'italic' : ''}`

  // Numbered Layout (original)
  if (layout === 'numbered') {
    return (
      <div className="space-y-6">
        {title && (
          <h2 className={titleClasses}>{title}</h2>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((step, index) => (
            <div key={index} className="relative flex flex-col h-full">
              <div className="flex items-start gap-4 flex-1">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-[#3B3634] flex items-center justify-center font-bold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h3 className="font-instrument-serif text-lg mb-2">{step.title}</h3>
                  <p className="text-sm text-[#3B3634]/70">{step.description}</p>
                </div>
              </div>
              {step.image_url && (
                <div className={`relative mt-4 w-full aspect-video overflow-hidden ${rounded_edges ? 'rounded-lg' : ''}`}>
                  <Image
                    src={step.image_url}
                    alt={step.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Cards Layout
  if (layout === 'cards') {
    return (
      <div className="space-y-6">
        {title && (
          <h2 className={titleClasses}>{title}</h2>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((step, index) => (
            <div key={index} className={`bg-[#F4F0EB] p-5 flex flex-col h-full ${rounded_edges ? 'rounded-lg' : ''}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#3B3634] text-white flex items-center justify-center font-bold text-lg">
                  {index + 1}
                </div>
                <h3 className="font-instrument-serif text-lg">{step.title}</h3>
              </div>
              <p className="text-sm text-[#3B3634]/70 mb-4 flex-1">{step.description}</p>
              {step.image_url && (
                <div className={`relative w-full aspect-video overflow-hidden ${rounded_edges ? 'rounded-lg' : ''}`}>
                  <Image
                    src={step.image_url}
                    alt={step.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Minimal Layout
  if (layout === 'minimal') {
    return (
      <div className="space-y-6">
        {title && (
          <h2 className={titleClasses}>{title}</h2>
        )}
        <div className="max-w-4xl mx-auto space-y-8">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-full bg-[#3B3634] text-white flex items-center justify-center font-bold text-2xl">
                  {index + 1}
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-instrument-serif text-xl mb-2">{step.title}</h3>
                <p className="text-[#3B3634]/70 mb-4">{step.description}</p>
                {step.image_url && (
                  <div className={`relative w-full aspect-video overflow-hidden ${rounded_edges ? 'rounded-lg' : ''}`}>
                    <Image
                      src={step.image_url}
                      alt={step.title}
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
    )
  }

  return null
}
