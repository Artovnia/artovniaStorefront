import Image from "next/image"
import Link from "next/link"
import PortableText from "./PortableText"
import { urlFor } from "../lib/sanity"
import { Header } from "@/components/organisms/Header/Header"
import { Footer } from "@/components/organisms/Footer/Footer"
import { ArrowRightIcon } from "@/icons"
import { Breadcrumbs } from "@/components/atoms/Breadcrumbs/Breadcrumbs"

interface LinkedProduct {
  productId: string
  productName: string
  productImage?: {
    asset: {
      _ref: string
    }
    alt?: string
  }
}

// Use the SellerPost type from data.ts to maintain consistency
import type { SellerPost } from "../lib/data"

interface SellerPostLayoutProps {
  post: SellerPost
}

export async function SellerPostLayout({ post }: SellerPostLayoutProps) {

  return (
    <>
      <Header />
      
      {/* Breadcrumbs */}
      <div className="bg-[#F4F0EB] px-4 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto mt-12 xl:mt-20">
          <Breadcrumbs 
            items={[
              { label: 'Strona główna', path: '/' },
              { label: 'Blog', path: '/blog' },
              { label: post.sellerName, path: `/blog/${post.slug.current}` }
            ]}
          />
        </div>
      </div>

      <article className="min-h-screen bg-[#F4F0EB]">
      {/* Hero Section with Artistic Layout */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-12">
          <div className="absolute top-10 left-10 w-32 h-32 border border-[#BFB7AD] opacity-60 rounded-full"></div>
          <div className="absolute top-32 right-20 w-24 h-24 border border-[#BFB7AD] opacity-70 rounded-full"></div>
          <div className="absolute bottom-20 left-32 w-40 h-40 border-2 border-[#3B3634] opacity-5 rotate-45"></div>
          
          <div className="absolute top-16 right-4 w-16 h-16 border-2 border-[#BFB7AD] rounded-full opacity-30"></div>
          <div className="absolute bottom-32 left-0 w-8 h-8 bg-[#BFB7AD] rounded-full opacity-10"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <p className="text-[#3B3634] text-lg font-light tracking-wide uppercase">
                  Projektant tygodnia
                </p>
                <h1 className="text-4xl lg:text-6xl font-instrument-serif italic text-[#3B3634] leading-tight">
                  {post.sellerName}
                </h1>
                <div className="w-24 h-1 bg-[#BFB7AD]"></div>
              </div>
              
              <p className="text-xl text-[#3B3634] leading-relaxed font-light">
                {post.shortDescription}
              </p>

              {/* Visit Store Button */}
              <Link 
                href={`/sellers/${post.sellerHandle}`}
                className="inline-flex items-center space-x-3 ring-1 ring-[#BFB7AD] text-black px-8 py-4  hover:bg-[#3B3634] hover:text-white transition-all duration-300 group"
              >
                <span className="font-medium">ODWIEDŹ SKLEP</span>
                <ArrowRightIcon className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" size={20} color="currentColor" />
              </Link>
            </div>

            {/* Right Images - Artistic Layout */}
            <div className="relative h-[500px] lg:h-[600px] w-full">
              {/* Main Image */}
              <div className="absolute top-0 left-8 w-[320px] md:w-[400px] lg:w-[450px] h-4/5 transform -rotate-2 shadow-2xl">
                <div className="relative w-full h-full rounded-lg overflow-hidden border-8 border-white">
                  <Image
                    src={post.mainImage && post.mainImage.asset ? 
                      urlFor(post.mainImage).width(600).height(480).url() : 
                      "/images/hero/Image.jpg"
                    }
                    alt={post.mainImage?.alt || "Featured seller image"}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              </div>

              {/* Secondary Image */}
              <div className="absolute bottom-0 right-0 w-[180px] md:w-[220px] lg:w-[250px] h-2/5 transform rotate-3 shadow-xl">
                <div className="relative w-full h-full rounded-lg overflow-hidden border-4 border-white">
                  <Image
                    src={post.secondaryImage && post.secondaryImage.asset ? 
                      urlFor(post.secondaryImage).width(400).height(300).url() : 
                      "/images/hero/Image.jpg"
                    }
                    alt={post.secondaryImage?.alt || "Secondary seller image"}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
              </div>

     
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 lg:py-24">
        <div className="max-w-4xl mx-auto px-4 lg:px-8">
          {/* Article Content */}
          <div className="prose prose-lg max-w-none">
            <div className="text-[#3B3634] leading-relaxed">
              <PortableText content={post.content} />
            </div>
          </div>

          {/* Featured Products Section */}
          {post.linkedProducts && post.linkedProducts.length > 0 && (
            <div className="mt-16 pt-16 border-t border-[#BFB7AD]/30">
              <h2 className="text-3xl font-light text-[#3B3634] mb-8 text-center font-instrument-serif">
                Wybrane <span className="italic">dzieła</span>
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {post.linkedProducts.map((product, index) => (
                  <div 
                    key={product.productId}
                    className={`group cursor-pointer transform hover:scale-105 transition-all duration-300 ${
                      index % 2 === 0 ? 'rotate-1' : '-rotate-1'
                    } hover:rotate-0`}
                  >
                    <div className="bg-primary rounded-lg shadow-lg overflow-hidden border-2 border-[#BFB7AD]">
                      {product.productImage && (
                        <div className="relative h-64">
                          <Image
                            src={product.productImage && product.productImage.asset ? 
                              urlFor(product.productImage).width(300).height(256).url() : 
                              "/images/hero/Image.jpg"
                            }
                            alt={product.productImage?.alt || product.productName}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                            sizes="(max-width: 768px) 100vw, 33vw"
                          />
                        </div>
                      )}
                      <div className="p-6">
                        <h3 className="text-lg font-medium text-[#3B3634] group-hover:text-[#BFB7AD] transition-colors duration-300">
                          {product.productName}
                        </h3>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Call to Action */}
          <div className="mt-16 text-center">
            <div className="inline-block p-8 ">
              <p className="text-lg text-[#3B3634] mb-6 font-instrument-sans">
                Odkryj więcej prac artysty w jego sklepie
              </p>
              <Link 
                href={`/sellers/${post.sellerHandle}`}
                className="inline-flex items-center space-x-3 ring-1 ring-[#BFB7AD] text-black px-8 py-4 hover:bg-[#3B3634] hover:text-white transition-all duration-300 group"
              >
                <span className="font-instrument-sans">PRZEJDŹ DO SKLEPU</span>
                <ArrowRightIcon className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" size={20} color="currentColor" />
              </Link>
            </div>
          </div>
        </div>
      </section>


      </article>
      
      <Footer />
    </>
  )
}
