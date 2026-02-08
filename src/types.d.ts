declare module '*.lodash';

// Static image imports (Next.js provides these via next-env.d.ts,
// but explicit declaration ensures TypeScript resolves them correctly)
declare module '*.webp' {
  import { StaticImageData } from 'next/image'
  const content: StaticImageData
  export default content
}
