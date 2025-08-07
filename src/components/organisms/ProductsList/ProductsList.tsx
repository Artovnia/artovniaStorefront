"use client";

import { ProductCard } from '../ProductCard/ProductCard';
import { HttpTypes } from '@medusajs/types';
import { useState, useEffect } from 'react';
import { SerializableWishlist } from '@/types/wishlist';
import { retrieveCustomer } from '@/lib/data/customer';
import { getUserWishlists } from '@/lib/data/wishlist';

export const ProductsList = ({
  products,
}: {
  products: HttpTypes.StoreProduct[];
}) => {
  // Add state for user and wishlist data
  const [user, setUser] = useState<HttpTypes.StoreCustomer | null>(null);
  const [wishlist, setWishlist] = useState<SerializableWishlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Function to refresh wishlist data after changes
  const refreshWishlist = async () => {
    if (!user) return;
    
    try {
      const wishlistData = await getUserWishlists();
      setWishlist(wishlistData.wishlists || []);
    } catch (error) {
      console.error('Error refreshing wishlist:', error);
    }
  };
  
  // Initial fetch when component mounts
  useEffect(() => {
    async function fetchUserData() {
      try {
        setIsLoading(true);
        const customer = await retrieveCustomer();
        setUser(customer);
        
        if (customer) {
          const wishlistData = await getUserWishlists();
          setWishlist(wishlistData.wishlists || []);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setUser(null);
        setWishlist([]);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchUserData();
  }, []);
  
  return (
    <>
      {products.map((product) => (
        <ProductCard 
          key={product.id} 
          product={product} 
          user={user}
          wishlist={wishlist}
          onWishlistChange={refreshWishlist}
        />
      ))}
    </>
  );
};
