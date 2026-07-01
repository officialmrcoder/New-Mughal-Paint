'use client';

import React, { useState, useEffect, use } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { getMockDatabase, isSupabaseConfigured, supabase } from '@/lib/supabase';
import { authService } from '@/lib/auth';
import { cartService } from '@/lib/cart';
import { wishlistService } from '@/lib/wishlist';
import { Check, ShoppingCart, Paintbrush, ArrowLeft, ShieldCheck, Heart, Share2, Plus, Minus } from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ProductDetailPage({ params }: PageProps) {
  const router = useRouter();
  const { id: productId } = use(params);

  const [product, setProduct] = useState<any>(null);
  const [category, setCategory] = useState<any>(null);
  const [shades, setShades] = useState<any[]>([]);
  const [selectedShade, setSelectedShade] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  const [loading, setLoading] = useState(true);
  const [cartSuccess, setCartSuccess] = useState<string | null>(null);
  const [cartError, setCartError] = useState<string | null>(null);

  // Wishlist states
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // Check wishlist status
  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (currentUser && productId) {
        try {
          const isWish = await wishlistService.isInWishlist(currentUser.id, productId, selectedShade?.id);
          setIsWishlisted(isWish);
        } catch (e) {
          console.error(e);
        }
      }
    };
    checkWishlistStatus();
  }, [currentUser, productId, selectedShade]);

  const handleToggleWishlist = async () => {
    setCartSuccess(null);
    setCartError(null);

    if (!currentUser) {
      router.push(`/login?redirect=/products/${productId}`);
      return;
    }

    setWishlistLoading(true);
    try {
      if (isWishlisted) {
        await wishlistService.removeFromWishlistByDetails(currentUser.id, productId, selectedShade?.id);
        setIsWishlisted(false);
        setCartSuccess('Removed from your royal wishlist.');
      } else {
        await wishlistService.addToWishlist(currentUser.id, productId, selectedShade?.id);
        setIsWishlisted(true);
        setCartSuccess('Added to your royal wishlist!');
      }
    } catch (e: any) {
      setCartError(e.message || 'Failed to update wishlist.');
    } finally {
      setWishlistLoading(false);
    }
  };

  useEffect(() => {
    const loadProductData = async () => {
      setLoading(true);
      let foundProduct: any = null;
      let foundCategory: any = null;
      let foundShades: any[] = [];

      // Check user session
      const user = await authService.getCurrentUser();
      setCurrentUser(user);

      if (isSupabaseConfigured()) {
        try {
          const { data: prodData, error: prodErr } = await supabase
            .from('products')
            .select('*')
            .eq('id', productId)
            .maybeSingle();

          if (!prodErr && prodData) {
            foundProduct = prodData;

            // Fetch category
            if (prodData.category_id) {
              const { data: catData } = await supabase
                .from('categories')
                .select('*')
                .eq('id', prodData.category_id)
                .maybeSingle();
              foundCategory = catData;
            }

            // Fetch shades
            const { data: shadeData } = await supabase
              .from('product_shades')
              .select('*')
              .eq('product_id', productId);
            if (shadeData) foundShades = shadeData;
          }
        } catch (e) {
          console.error('Error fetching product from Supabase:', e);
        }
      }

      // Local sandbox database fallback
      if (!foundProduct) {
        const mockDb = getMockDatabase();
        foundProduct = mockDb.products.find((p: any) => p.id === productId);
        if (foundProduct) {
          foundCategory = mockDb.categories.find((c: any) => c.id === foundProduct.category_id);
          foundShades = mockDb.shades.filter((s: any) => s.product_id === productId);
        }
      }

      if (foundProduct) {
        setProduct(foundProduct);
        setCategory(foundCategory);
        setShades(foundShades);
        // Default to first shade if available
        if (foundShades.length > 0) {
          setSelectedShade(foundShades[0]);
        }
      }
      setLoading(false);
    };

    loadProductData();
  }, [productId]);

  const handleAddToCart = async () => {
    setCartSuccess(null);
    setCartError(null);

    if (!currentUser) {
      // User is not logged in, redirect to login page
      router.push('/login');
      return;
    }

    if (!selectedShade) {
      setCartError('Please select a shade before adding to cart.');
      return;
    }

    try {
      await cartService.addToCart(currentUser.id, product.id, selectedShade.id, quantity);
      setCartSuccess(`Added ${quantity}x ${product.name} (${selectedShade.shade_name}) to your royal cart!`);
    } catch (e: any) {
      setCartError(e.message || 'Failed to add item to cart.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col justify-between">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center py-24 space-y-4">
          <div className="w-12 h-12 border-4 border-[#8B1E2A] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs uppercase font-mono tracking-widest text-[#C5A059] font-bold">Unveiling Product Royal Formulation...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col justify-between">
        <Header />
        <main className="flex-1 max-w-7xl mx-auto w-full py-16 px-4 text-center space-y-4">
          <h1 className="font-heading text-3xl font-bold text-[#8B1E2A]">Formulation Not Found</h1>
          <p className="text-sm text-[#554D4D]">The requested royal paint mixture could not be located in our catalog matrix.</p>
          <div className="pt-4">
            <Link 
              href="/products" 
              className="inline-flex items-center gap-2 bg-[#8B1E2A] text-white px-6 py-2.5 font-bold text-xs tracking-widest uppercase border-b-2 border-r-2 border-[#C5A059] hover:bg-[#721822]"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Catalog
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Calculate price dynamically based on active shade selection
  const currentPrice = selectedShade?.price_override 
    ? Number(selectedShade.price_override) 
    : Number(product.base_price);

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col justify-between">
      <Header />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8">
        
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-neutral-400 font-mono tracking-wider text-left">
          <Link href="/" className="hover:text-[#8B1E2A] transition-colors">HOME</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-[#8B1E2A] transition-colors">CATALOG</Link>
          <span>/</span>
          <span className="text-[#8B1E2A] font-bold uppercase">{product.name}</span>
        </div>

        {/* Back Button */}
        <div className="text-left">
          <Link 
            href="/products"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8B1E2A] hover:text-[#721822] tracking-wider uppercase transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> BACK TO ALL PRODUCTS
          </Link>
        </div>

        {/* Product Details Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 bg-white border-2 border-[#D4CBB3] p-6 sm:p-8 relative shadow-sm">
          
          {/* Left Column: Image and Shade preview (5 columns) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="relative aspect-square w-full bg-[#FAF8F5] border-2 border-[#D4CBB3] overflow-hidden group">
              <img 
                src={product.image_url || 'https://picsum.photos/seed/paint/600/400'} 
                alt={product.name} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              
              {/* Dynamic Overlay colored shadow representing the selected color shade! */}
              {selectedShade && (
                <div 
                  className="absolute bottom-0 inset-x-0 h-4 transition-all duration-300"
                  style={{ backgroundColor: selectedShade.color_code }}
                />
              )}
            </div>

            {/* Quality Certifications */}
            <div className="bg-[#FAF8F5] border border-[#D4CBB3] p-4 flex items-center gap-3 text-left">
              <ShieldCheck className="w-8 h-8 text-[#C5A059] shrink-0 stroke-[1.5]" />
              <div>
                <h4 className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">ROYAL STANDARD QUALITY CHECKED</h4>
                <p className="text-[11px] text-[#554D4D] font-light mt-0.5">100% genuine formulation direct from the New Mughal flagship facilities.</p>
              </div>
            </div>
          </div>

          {/* Right Column: Information, Swatches and Controls (7 columns) */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6 text-left">
            
            {/* Header info */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B1E2A] bg-[#8B1E2A]/10 border border-[#8B1E2A]/20 px-3 py-1 font-mono">
                  {category?.name || 'Mughal Classic'}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-green-700 bg-green-50 border border-green-200 px-3 py-1 font-mono">
                  IN STOCK
                </span>
              </div>

              <h1 className="font-heading text-2xl sm:text-4xl font-light italic text-[#1A1A1A]">
                {product.name}
              </h1>

              {/* Decorative Line */}
              <div className="h-0.5 bg-gradient-to-r from-[#8B1E2A] to-transparent w-32" />

              <p className="text-sm text-[#554D4D] font-light leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Clickable Swatches Section */}
            <div className="space-y-3 pt-4 border-t border-dashed border-[#D4CBB3]">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] font-mono">
                  Select Shade: <strong className="text-[#8B1E2A]">{selectedShade?.shade_name || 'None'}</strong>
                </span>
                {selectedShade && (
                  <span className="text-xs font-bold text-[#C5A059] font-mono">
                    HEX: {selectedShade.color_code.toUpperCase()}
                  </span>
                )}
              </div>

              {shades.length === 0 ? (
                <p className="text-xs text-neutral-400 italic">No color shades registered for this formulation yet.</p>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                  {shades.map((shade) => {
                    const isSelected = selectedShade?.id === shade.id;
                    return (
                      <button
                        key={shade.id}
                        onClick={() => setSelectedShade(shade)}
                        className={`p-1.5 border-2 transition-all duration-200 text-center flex flex-col items-center gap-1.5 focus:outline-none ${
                          isSelected ? 'border-[#8B1E2A] bg-[#FAF8F5]' : 'border-[#D4CBB3] hover:border-[#8B1E2A]/60 bg-white'
                        }`}
                        title={shade.shade_name}
                      >
                        {/* Swatch color block */}
                        <div 
                          className="w-10 h-10 border border-neutral-300 relative flex items-center justify-center shrink-0 shadow-inner"
                          style={{ backgroundColor: shade.color_code }}
                        >
                          {isSelected && (
                            <Check className={`w-5 h-5 drop-shadow ${
                              // Simple color luminance checking trick for checkmark color
                              shade.color_code.toLowerCase() === '#fdfbf7' || shade.color_code.toLowerCase() === '#f5f5f0' || shade.color_code.toLowerCase() === '#faf0e6' || shade.color_code.toLowerCase() === '#faf4e7' || shade.color_code.toLowerCase() === '#e3dac9' || shade.color_code.toLowerCase() === '#f7f4eb'
                                ? 'text-[#1A1A1A]' 
                                : 'text-white'
                            }`} />
                          )}
                        </div>
                        
                        {/* Swatch name */}
                        <span className="text-[10px] font-bold text-[#1A1A1A] truncate w-full leading-tight">
                          {shade.shade_name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Pricing and Actions Row */}
            <div className="pt-6 border-t-2 border-[#FAF8F5] space-y-4">
              
              {/* Display pricing */}
              <div className="flex items-baseline gap-3">
                <span className="text-xs font-bold uppercase text-neutral-400 font-mono tracking-wider">Formula Cost:</span>
                <span className="text-3xl font-extrabold text-[#C5A059] font-mono">
                  PKR {currentPrice.toLocaleString()}
                </span>
                {selectedShade?.price_override && (
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-[#8B1E2A]/10 border border-[#8B1E2A]/20 text-[#8B1E2A] font-mono animate-pulse">
                    Premium Tint included (+PKR {(currentPrice - Number(product.base_price)).toLocaleString()})
                  </span>
                )}
              </div>

              {/* Success / Error Banners */}
              {cartSuccess && (
                <div className="p-3 bg-green-50 border-l-4 border-green-500 text-green-700 text-xs font-semibold">
                  {cartSuccess}
                </div>
              )}
              {cartError && (
                <div className="p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs font-semibold">
                  {cartError}
                </div>
              )}

              {/* Controls and Actions buttons */}
              <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center pt-2">
                
                {/* Quantity selector */}
                <div className="flex items-center border-2 border-[#D4CBB3] bg-white self-start sm:self-auto shrink-0">
                  <button 
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="p-3 hover:bg-[#FAF8F5] transition-colors border-r border-[#D4CBB3]"
                    title="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5 text-[#554D4D]" />
                  </button>
                  <span className="px-5 font-mono font-bold text-sm text-[#1A1A1A]">
                    {quantity}
                  </span>
                  <button 
                    onClick={() => setQuantity(q => q + 1)}
                    className="p-3 hover:bg-[#FAF8F5] transition-colors border-l border-[#D4CBB3]"
                    title="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#554D4D]" />
                  </button>
                </div>

                {/* Add to Cart button */}
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-[#8B1E2A] text-white py-3.5 px-6 font-bold tracking-widest text-xs uppercase border-b-2 border-r-2 border-[#C5A059] hover:bg-[#721822] transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4 text-[#C5A059]" />
                  ADD TO DISPATCH ORDER
                </button>

                {/* Wishlist toggle button */}
                <button
                  onClick={handleToggleWishlist}
                  disabled={wishlistLoading}
                  className={`p-3 border-2 transition-colors flex items-center justify-center shrink-0 ${
                    isWishlisted 
                      ? 'bg-rose-50 border-[#8B1E2A] text-[#8B1E2A]' 
                      : 'bg-white border-[#D4CBB3] text-gray-400 hover:text-[#8B1E2A] hover:border-[#8B1E2A]'
                  }`}
                  title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-[#8B1E2A]' : ''}`} />
                </button>

                {/* Visualize button */}
                {selectedShade && (
                  <Link
                    href={`/visualizer?color=${encodeURIComponent(selectedShade.color_code)}`}
                    className="flex-1 bg-white hover:bg-[#FAF8F5] text-[#8B1E2A] py-3.5 px-6 font-bold tracking-widest text-xs uppercase border-2 border-[#D4CBB3] transition-colors flex items-center justify-center gap-2"
                  >
                    <Paintbrush className="w-4 h-4 text-[#C5A059]" />
                    VISUALIZE THIS COLOR
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
