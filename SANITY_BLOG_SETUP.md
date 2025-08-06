# Sanity CMS Blog Integration - Complete Setup Guide

## Overview

This guide provides complete instructions for setting up and using the Sanity CMS blog integration in your Medusa.js Next.js 15 storefront.

## 📁 Project Structure

All Sanity-related files are organized within `src/app/blog/`:

```
src/app/blog/
├── components/
│   ├── BlogLayout.tsx          # Main blog layout wrapper
│   ├── BlogPostCard.tsx        # Blog post card component
│   ├── BlogSearch.tsx          # Search functionality
│   └── PortableText.tsx        # Rich content renderer
├── lib/
│   ├── sanity.ts              # Sanity client & queries
│   └── data.ts                # Data fetching functions
├── schemas/
│   ├── author.ts              # Author schema
│   ├── blogCategory.ts        # Category schema
│   ├── blogPost.ts            # Blog post schema
│   ├── blockContent.ts        # Rich content schema
│   └── index.ts               # Schema exports
├── category/[slug]/
│   └── page.tsx               # Category pages
├── search/
│   └── page.tsx               # Search results page
├── [slug]/
│   └── page.tsx               # Individual blog post pages
├── loading.tsx                # Loading states
└── page.tsx                   # Main blog page

sanity.config.ts               # Sanity configuration (root level)
```

## 🔧 Environment Variables Setup

Add the following environment variables to your `.env` file:

```env
# Sanity CMS Configuration
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your_api_token_here
```

### How to get these values:

1. **Project ID**: Found in your Sanity project dashboard URL or project settings
2. **Dataset**: Usually `production` for live sites, `development` for testing
3. **API Token**: Create in Sanity Studio → API → Tokens (needs read permissions)

## 🚀 Getting Started

### 1. Install Dependencies (Already Done)
The following packages are already installed:
- `@sanity/client` - Sanity client
- `@sanity/image-url` - Image URL builder
- `@portabletext/react` - Rich content rendering
- `@sanity/vision` - Query testing tool
- `sanity` - Sanity Studio

### 2. Configure Environment Variables
Set up your `.env` file with the values from your Sanity project.

### 3. Start Sanity Studio
Run the following command to start Sanity Studio locally:

```bash
npx sanity dev
```

This will start the Sanity Studio at `http://localhost:3333` where you can:
- Create and manage blog posts
- Add authors and categories
- Upload images
- Preview content

### 4. Start Your Next.js Application
```bash
npm run dev
```

Your blog will be available at `http://localhost:3000/blog`

## 📝 Content Management

### Creating Content in Sanity Studio

1. **Authors**: Create author profiles with bio, image, and social links
2. **Categories**: Organize posts with categories (with color coding)
3. **Blog Posts**: Create rich content posts with:
   - Title and SEO-friendly slug
   - Excerpt for previews
   - Rich content with images, code blocks, and formatting
   - Author assignment
   - Category tagging
   - Custom tags
   - Featured post designation
   - SEO metadata

### Content Schema Features

#### Blog Post Schema
- **Title & Slug**: SEO-friendly URLs
- **Excerpt**: Short description for previews
- **Rich Content**: Full Portable Text support with:
  - Headings (H1-H4)
  - Paragraphs and text formatting
  - Images with captions
  - Code blocks with syntax highlighting
  - Links (internal/external)
  - Lists (bullet/numbered)
  - Blockquotes
- **Author Reference**: Link to author profiles
- **Categories**: Multiple category assignment
- **Tags**: Flexible tagging system
- **Featured Flag**: Highlight important posts
- **SEO Fields**: Meta title, description, keywords

#### Author Schema
- **Name & Slug**: Author identification
- **Bio**: Rich text biography
- **Image**: Profile picture
- **Contact**: Email and social links
- **Social Links**: Twitter, LinkedIn, website

#### Category Schema
- **Title & Slug**: Category identification
- **Description**: Category explanation
- **Color**: Visual categorization

## 🎨 Frontend Features

### Blog Pages

1. **Main Blog Page** (`/blog`)
   - Featured posts section
   - All posts grid
   - Search functionality
   - Category navigation

2. **Individual Post Pages** (`/blog/[slug]`)
   - Full post content with rich formatting
   - Author information and bio
   - Category and tag display
   - SEO optimization
   - Social sharing ready

3. **Category Pages** (`/blog/category/[slug]`)
   - Posts filtered by category
   - Category description
   - Breadcrumb navigation

4. **Search Page** (`/blog/search`)
   - Full-text search functionality
   - Search results with highlighting
   - No results handling

### UI Components

#### BlogLayout
- Consistent header with navigation
- Search integration
- Category menu
- Responsive design

#### BlogPostCard
- Post preview with image
- Author and date information
- Category tags
- Excerpt display
- Featured post highlighting

#### PortableText
- Rich content rendering
- Image optimization
- Code syntax highlighting
- Custom link handling
- Responsive design

#### BlogSearch
- Real-time search
- URL-based search state
- Clear functionality
- Responsive input

## 🔍 SEO Features

- **Dynamic Meta Tags**: Title, description, keywords
- **Open Graph**: Social media previews
- **Twitter Cards**: Twitter-specific previews
- **Structured Data**: Ready for schema markup
- **Sitemap Ready**: All pages are statically generated
- **Image Optimization**: Automatic image resizing and optimization

## 🚀 Performance Features

- **Static Generation**: All blog pages are pre-generated
- **Image Optimization**: Sanity CDN with Next.js Image component
- **Caching**: Smart caching with revalidation
- **Lazy Loading**: Images and content load progressively
- **Bundle Splitting**: Optimized JavaScript delivery

## 🛠 Customization

### Styling
All components use Tailwind CSS classes and can be easily customized by modifying the class names in the component files.

### Adding New Content Types
1. Create new schema files in `src/app/blog/schemas/`
2. Add to `schemas/index.ts`
3. Create corresponding data fetching functions in `lib/data.ts`
4. Build UI components as needed

### Custom Queries
Add new GROQ queries in `lib/sanity.ts` and corresponding data functions in `lib/data.ts`.

## 🔧 Development Workflow

1. **Content Creation**: Use Sanity Studio to create and manage content
2. **Development**: Run `npm run dev` for local development
3. **Preview**: Content changes appear immediately in development
4. **Production**: Deploy with automatic static generation

## 📱 Responsive Design

The blog is fully responsive with:
- Mobile-first design approach
- Flexible grid layouts
- Optimized images for all screen sizes
- Touch-friendly navigation

## 🔒 Security

- **Environment Variables**: Sensitive data stored securely
- **API Tokens**: Read-only tokens for frontend
- **CORS**: Properly configured for your domain
- **Content Validation**: Schema validation in Sanity

## 🚀 Deployment

### Vercel/Netlify Deployment
1. Add environment variables to your deployment platform
2. Deploy your Next.js application
3. Sanity Studio can be deployed separately or accessed via `npx sanity deploy`

### Environment Variables for Production
```env
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your_production_token
```

## 🎯 Usage Examples

### Fetching Blog Posts
```typescript
import { getBlogPosts, getBlogPost } from '@/app/blog/lib/data'

// Get all posts
const posts = await getBlogPosts()

// Get single post
const post = await getBlogPost('my-blog-post-slug')
```

### Using Components
```tsx
import BlogPostCard from '@/app/blog/components/BlogPostCard'
import PortableText from '@/app/blog/components/PortableText'

// Display post card
<BlogPostCard post={post} featured={true} />

// Render rich content
<PortableText content={post.content} />
```

## 🆘 Troubleshooting

### Common Issues

1. **Environment Variables Not Working**
   - Ensure variables start with `NEXT_PUBLIC_` for client-side access
   - Restart development server after adding variables

2. **Sanity Studio Not Loading**
   - Check project ID and dataset in `sanity.config.ts`
   - Verify API token permissions

3. **Images Not Loading**
   - Verify Sanity project ID in image URLs
   - Check CORS settings in Sanity project

4. **Build Errors**
   - Ensure all environment variables are set in production
   - Check for TypeScript errors in components

### Getting Help

- **Sanity Documentation**: https://www.sanity.io/docs
- **Next.js Documentation**: https://nextjs.org/docs
- **Portable Text**: https://portabletext.org/

## ✅ Testing Checklist

- [ ] Environment variables configured
- [ ] Sanity Studio accessible
- [ ] Blog pages load correctly
- [ ] Search functionality works
- [ ] Images display properly
- [ ] SEO meta tags present
- [ ] Mobile responsive design
- [ ] Content creation workflow tested

## 🎉 You're Ready!

Your Sanity CMS blog integration is now complete and ready for use. Start by creating content in Sanity Studio and watch it appear automatically on your blog pages.

Visit `/blog` on your storefront to see the blog in action!
