'use client'

import Image from 'next/image'

interface TeamMember {
  name: string
  role?: string
  bio?: string
  image_url?: string
  image_id?: string
}

interface TeamBlockData {
  title?: string
  title_alignment?: 'left' | 'center' | 'right'
  title_italic?: boolean
  description?: string
  members: TeamMember[]
  layout?: 'circular' | 'cards' | 'minimal'
  rounded_edges?: boolean
}

interface TeamBlockProps {
  data: TeamBlockData
}

export const TeamBlock = ({ data }: TeamBlockProps) => {
  const { 
    title, 
    title_alignment = 'center',
    title_italic = false,
    description, 
    members = [], 
    layout = 'circular', 
    rounded_edges = true 
  } = data

  const titleAlignmentClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  }

  const titleClasses = `text-xl md:text-2xl font-instrument-serif ${titleAlignmentClasses[title_alignment]} ${title_italic ? 'italic' : ''}`

  if (!members.length) {
    return null
  }

  // Circular Layout (original)
  if (layout === 'circular') {
    return (
      <div className="space-y-6">
        {(title || description) && (
          <div className="text-center max-w-2xl mx-auto">
            {title && (
              <h2 className={titleClasses}>{title}</h2>
            )}
            {description && (
              <p className="text-sm text-[#3B3634]/70">{description}</p>
            )}
          </div>
        )}
        
        <div className={`grid gap-6 ${
          members.length === 1 ? 'grid-cols-1 max-w-sm mx-auto' :
          members.length === 2 ? 'grid-cols-1 md:grid-cols-2 max-w-2xl mx-auto' :
          'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        }`}>
          {members.map((member, index) => (
            <div key={index} className="text-center">
              <div className="relative w-32 h-32 md:w-40 md:h-40 mx-auto mb-4 rounded-full overflow-hidden bg-[#F4F0EB]">
                {member.image_url ? (
                  <Image
                    src={member.image_url}
                    alt={member.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 128px, 160px"
                    quality={90}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-12 h-12 text-[#3B3634]/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </div>
              <h3 className="text-lg font-instrument-serif mb-1">{member.name}</h3>
              {member.role && (
                <p className="text-xs text-[#3B3634]/60 uppercase tracking-wider mb-2">{member.role}</p>
              )}
              {member.bio && (
                <p className="text-[#3B3634]/70 text-sm max-w-xs mx-auto">{member.bio}</p>
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
        {(title || description) && (
          <div className="text-center max-w-2xl mx-auto">
            {title && (
              <h2 className={titleClasses}>{title}</h2>
            )}
            {description && (
              <p className="text-sm text-[#3B3634]/70">{description}</p>
            )}
          </div>
        )}
        
        <div className={`grid gap-6 ${
          members.length === 1 ? 'grid-cols-1 max-w-sm mx-auto' :
          members.length === 2 ? 'grid-cols-1 md:grid-cols-2 max-w-2xl mx-auto' :
          'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        }`}>
          {members.map((member, index) => (
            <div key={index} className={`bg-[#F4F0EB] p-5 text-center ${rounded_edges ? 'rounded-lg' : ''}`}>
              <div className={`relative w-32 h-32 mx-auto mb-4 overflow-hidden bg-white ${rounded_edges ? 'rounded-lg' : ''}`}>
                {member.image_url ? (
                  <Image
                    src={member.image_url}
                    alt={member.name}
                    fill
                    className="object-cover"
                    sizes="128px"
                    quality={90}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-12 h-12 text-[#3B3634]/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </div>
              <h3 className="text-lg font-instrument-serif mb-1">{member.name}</h3>
              {member.role && (
                <p className="text-xs text-[#3B3634]/60 uppercase tracking-wider mb-2">{member.role}</p>
              )}
              {member.bio && (
                <p className="text-[#3B3634]/70 text-sm">{member.bio}</p>
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
        {(title || description) && (
          <div className="text-center max-w-2xl mx-auto">
            {title && (
              <h2 className={titleClasses}>{title}</h2>
            )}
            {description && (
              <p className="text-sm text-[#3B3634]/70">{description}</p>
            )}
          </div>
        )}
        
        <div className="max-w-4xl mx-auto space-y-6">
          {members.map((member, index) => (
            <div key={index} className="flex flex-col md:flex-row gap-6 items-center md:items-start">
              <div className={`relative flex-shrink-0 w-24 h-24 overflow-hidden bg-[#F4F0EB] ${rounded_edges ? 'rounded-lg' : ''}`}>
                {member.image_url ? (
                  <Image
                    src={member.image_url}
                    alt={member.name}
                    fill
                    className="object-cover"
                    sizes="96px"
                    quality={90}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-[#3B3634]/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-xl font-instrument-serif mb-1">{member.name}</h3>
                {member.role && (
                  <p className="text-sm text-[#3B3634]/60 uppercase tracking-wider mb-2">{member.role}</p>
                )}
                {member.bio && (
                  <p className="text-[#3B3634]/70">{member.bio}</p>
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
