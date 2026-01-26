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
  description?: string
  members: TeamMember[]
}

interface TeamBlockProps {
  data: TeamBlockData
}

export const TeamBlock = ({ data }: TeamBlockProps) => {
  const { title, description, members = [] } = data

  if (!members.length) {
    return null
  }

  return (
    <div className="space-y-8">
      {(title || description) && (
        <div className="text-center max-w-2xl mx-auto">
          {title && (
            <h2 className="text-2xl md:text-3xl font-instrument-serif italic mb-4">{title}</h2>
          )}
          {description && (
            <p className="text-[#3B3634]/70">{description}</p>
          )}
        </div>
      )}
      
      <div className={`grid gap-8 ${
        members.length === 1 ? 'grid-cols-1 max-w-sm mx-auto' :
        members.length === 2 ? 'grid-cols-1 md:grid-cols-2 max-w-2xl mx-auto' :
        'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
      }`}>
        {members.map((member, index) => (
          <div key={index} className="text-center">
            <div className="relative w-36 h-36 md:w-44 md:h-44 mx-auto mb-4 rounded-full overflow-hidden bg-[#F4F0EB]">
              {member.image_url ? (
                <Image
                  src={member.image_url}
                  alt={member.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 144px, 176px"
                  quality={90}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-16 h-16 text-[#3B3634]/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
            </div>
            <h3 className="text-xl font-instrument-serif mb-1">{member.name}</h3>
            {member.role && (
              <p className="text-sm text-[#3B3634]/60 uppercase tracking-wider mb-3">{member.role}</p>
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
