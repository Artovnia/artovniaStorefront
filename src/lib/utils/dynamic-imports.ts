// Dynamic import utilities to reduce initial bundle size
import { lazy } from 'react';

// Lazy load heavy components to reduce page.js bundle size
// Use proper named exports to avoid TypeScript errors
export const LazyAlgoliaProductsListing = lazy(() => 
  import('@/components/sections/ProductListing/AlgoliaProductsListing').then(module => ({
    default: module.AlgoliaProductsListing
  }))
);

export const LazyProductListing = lazy(() => 
  import('@/components/sections/ProductListing/ProductListing').then(module => ({
    default: module.ProductListing
  }))
);

export const LazyHomeProductsCarousel = lazy(() => 
  import('@/components/organisms/HomeProductsCarousel/HomeProductsCarousel').then(module => ({
    default: module.HomeProductsCarousel
  }))
);

export const LazyProductCard = lazy(() => 
  import('@/components/organisms/ProductCard/ProductCard').then(module => ({
    default: module.ProductCard
  }))
);

// Preload critical components after initial page load
export const preloadCriticalComponents = () => {
  // Preload components that are likely to be needed soon
  if (typeof window !== 'undefined') {
    setTimeout(() => {
      import('@/components/sections/ProductListing/AlgoliaProductsListing').catch(console.warn);
      import('@/components/sections/ProductListing/ProductListing').catch(console.warn);
      import('@/components/organisms/HomeProductsCarousel/HomeProductsCarousel').catch(console.warn);
    }, 1000); // Preload after 1 second
  }
};

// Bundle splitting helpers
export const loadComponentWhenVisible = (componentImport: () => Promise<any>) => {
  return lazy(() => componentImport());
};

// Route-based code splitting
export const routeComponents = {
  categories: () => import('@/components/sections/ProductListing/ProductListing'),
  products: () => import('@/components/organisms/ProductCard/ProductCard'),
  cart: () => import('@/components/sections/Cart/Cart'),
  checkout: () => import('@/app/[locale]/(checkout)/checkout/page'),
};
