'use client'

interface VideoBlockData {
  video_url: string
  title?: string
  autoplay?: boolean
}

interface VideoBlockProps {
  data: VideoBlockData
}

function getEmbedUrl(url: string): string | null {
  // YouTube
  const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)
  if (youtubeMatch) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}`
  }

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`
  }

  return null
}

export const VideoBlock = ({ data }: VideoBlockProps) => {
  const { video_url, title } = data

  // Don't render empty video blocks
  if (!video_url || video_url.trim() === '') {
    return null
  }

  const embedUrl = getEmbedUrl(video_url)

  if (!embedUrl) {
    return (
      <div className="bg-gray-100 rounded-lg p-8 text-center">
        <p className="text-gray-500">Nieprawidłowy URL wideo</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {title && (
        <h3 className="text-xl font-medium">{title}</h3>
      )}
      <div className="relative aspect-video rounded-lg overflow-hidden">
        <iframe
          src={embedUrl}
          title={title || 'Video'}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  )
}
