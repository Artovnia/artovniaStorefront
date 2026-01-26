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
  steps: ProcessStep[]
}

interface ProcessBlockProps {
  data: ProcessBlockData
}

export const ProcessBlock = ({ data }: ProcessBlockProps) => {
  const { title, steps = [] } = data

  if (!steps.length) {
    return null
  }

  return (
    <div className="space-y-8">
      {title && (
        <h2 className="text-2xl md:text-3xl font-instrument-serif italic text-center">{title}</h2>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {steps.map((step, index) => (
          <div key={index} className="relative flex flex-col h-full">
            <div className="flex items-start gap-4 flex-1">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-[#3B3634] flex items-center justify-center font-bold">
                {index + 1}
              </div>
              <div className="flex-1">
                <h3 className="font-medium font-instrument-sans text-lg mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            </div>
            {/* Image always at bottom, aligned across all cards */}
            {step.image_url && (
              <div className="relative mt-4 rounded-lg w-full aspect-video overflow-hidden">
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
